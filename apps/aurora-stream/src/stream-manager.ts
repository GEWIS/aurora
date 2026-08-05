import { randomBytes } from 'node:crypto';

import { ResolvedStream, StreamUrls } from './stream-types';
import { ffmpegInputArgs, probe, YoutubeMedia } from './providers/youtube-provider';
import { buildFfmpegArgs } from './providers/output';
import { Ffmpeg, FfmpegStatus } from './ffmpeg';
import { MediaMtx } from './mediamtx';
import { HttpError } from './error';
import logger from './logger';

export type SourceType = 'yt' | 'screenshare';

/** The MediaMTX paths, which are fixed. Must match the `paths:` block in mediamtx.yml. */
export const SOURCE_TYPES: readonly SourceType[] = ['yt', 'screenshare'];

export interface StreamManagerConfig {
  webrtcPublic: string; // browser reachable
  rtspPublic: string; // audio reachable
  rtspInternal: string; // ffmpeg target
}

export interface ScreenShareSession {
  whipUrl: string;
  publishToken: string;
}

interface ActiveSource {
  ref: string;
  publishToken?: string;
}

export interface MediaMtxAuthRequest {
  action?: string;
  path?: string;
  ip?: string;
  query?: string;
}

export interface StreamState {
  active: Record<string, { ref: string }>;
  publisher: FfmpegStatus;
  urls: Record<SourceType, StreamUrls>;
}

/** Pull sources publish from our own ffmpeg inside the container. */
const LOOPBACK_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

export function isSourceType(value: unknown): value is SourceType {
  return SOURCE_TYPES.includes(value as SourceType);
}

export function createStreamManager(): StreamManager {
  const { WEBRTC_PUBLIC, RTSP_PUBLIC, RTSP_INTERNAL } = process.env;
  if (!WEBRTC_PUBLIC || !RTSP_PUBLIC || !RTSP_INTERNAL) {
    throw new Error('WEBRTC_PUBLIC, RTSP_PUBLIC and RTSP_INTERNAL are required');
  }

  const config: StreamManagerConfig = {
    webrtcPublic: WEBRTC_PUBLIC,
    rtspPublic: RTSP_PUBLIC,
    rtspInternal: RTSP_INTERNAL,
  };

  return new StreamManager(new Ffmpeg(), new MediaMtx(), config);
}

export class StreamManager {
  private readonly activeSources: Map<SourceType, ActiveSource> = new Map();
  private resolved?: { ref: string; media: YoutubeMedia };

  public constructor(
    private readonly publisher: Ffmpeg,
    private readonly mediamtx: MediaMtx,
    private readonly config: StreamManagerConfig,
  ) {
    this.publisher.onUnexpectedExit(() => this.activeSources.delete('yt'));
  }

  public async resolveYt(url: string): Promise<ResolvedStream> {
    const { stream, media } = await probe(url);
    this.resolved = { ref: url, media };

    return stream;
  }

  public async playYt(ref: string, position: number): Promise<void> {
    const media = await this.ytMedia(ref);
    this.activeSources.set('yt', { ref });

    const args = buildFfmpegArgs(
      ffmpegInputArgs(media, position),
      `${this.config.rtspInternal}/yt`,
    );
    await this.publisher.restart(args);
  }

  public async stopYt(): Promise<void> {
    this.activeSources.delete('yt');
    await this.publisher.stop();
  }

  private async ytMedia(ref: string): Promise<YoutubeMedia> {
    if (this.resolved?.ref === ref && this.resolved.media.expiresAt > Date.now()) {
      return this.resolved.media;
    }

    const { media } = await probe(ref);
    this.resolved = { ref, media };

    return media;
  }

  public startScreenshare(): ScreenShareSession {
    if (this.activeSources.has('screenshare')) {
      throw new HttpError(401, 'A screenshare session is already active.');
    }

    const publishToken = randomBytes(32).toString('hex');
    this.activeSources.set('screenshare', { ref: 'screenshare', publishToken });

    return { whipUrl: `${this.config.webrtcPublic}/screenshare/whip`, publishToken };
  }

  public async stopScreenshare(): Promise<void> {
    this.activeSources.delete('screenshare');
    await this.mediamtx.kickPublisher('screenshare');
  }

  /**
   * Answers MediaMTX's auth hook.
   * @param req the hook payload, none of which is trusted
   */
  public authorize(req: MediaMtxAuthRequest): boolean {
    if (!isSourceType(req.path)) return false;

    const active = this.activeSources.get(req.path);
    if (!active) return false;

    // Screens and the audio PC hold no credential; being in the active set is the grant.
    if (req.action === 'read') return true;
    if (req.action !== 'publish') return false;

    if (req.path === 'screenshare') {
      const token = new URLSearchParams(req.query ?? '').get('publishToken');
      return token !== null && token === active.publishToken;
    }

    return LOOPBACK_IPS.has(req.ip ?? '');
  }

  /**
   * Removes stale active screenshare entry if user disconnected unexpectedly.
   * @param path
   */
  public onPathNotReady(path: string): void {
    if (path !== 'screenshare') return;

    logger.info({ path }, 'publisher vanished, dropping path');
    this.activeSources.delete('screenshare');
  }

  public urlsFor(path: SourceType): StreamUrls {
    return {
      whepUrl: `${this.config.webrtcPublic}/${path}/whep`,
      rtspUrl: `${this.config.rtspPublic}/${path}`,
    };
  }

  public state(): StreamState {
    const active: Record<string, { ref: string }> = {};
    for (const [source, entry] of this.activeSources) {
      active[source] = { ref: entry.ref };
    }

    const urls = Object.fromEntries(SOURCE_TYPES.map((s) => [s, this.urlsFor(s)])) as Record<
      SourceType,
      StreamUrls
    >;

    return { active, publisher: this.publisher.status(), urls };
  }
}
