import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { HttpError } from '../error';
import logger from '../logger';
import { ResolvedStream } from '../stream-types';

const exec = promisify(execFile);

const FORMAT =
  'bestvideo[vcodec^=avc1]+bestaudio[ext=m4a]/bestvideo[vcodec^=avc1]+bestaudio/bestvideo+bestaudio/best';

export interface YoutubeMedia {
  videoUrl: string;
  audioUrl: string;
  headers: Record<string, string>; // googlevideo 403s without the ones yt-dlp negotiated
  expiresAt: number;
}

export interface YoutubeProbe {
  stream: ResolvedStream;
  media: YoutubeMedia;
}

interface YtDlpInfo {
  title?: string;
  duration?: number | null;
  is_live?: boolean;
  requested_formats?: { url: string; http_headers?: Record<string, string> }[];
}

async function runYtDlp(ref: string): Promise<YtDlpInfo> {
  try {
    const { stdout } = await exec(
      'yt-dlp',
      // prettier-ignore
      [
        '--dump-single-json',
        '--no-playlist',
        '--no-warnings',
        '--socket-timeout', '10',
        '-f', FORMAT,
        '--', ref,
      ],
      {
        timeout: 30_000,
        maxBuffer: 32 * 1024 * 1024, // the formats array can be larger than 1mb
      },
    );
    return JSON.parse(stdout) as YtDlpInfo;
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr?.trim().split('\n').at(-1);
    logger.warn({ ref, stderr }, 'yt-dlp failed');
    throw new HttpError(422, stderr ?? 'could not resolve this URL');
  }
}

function expiryOf(url: string): number {
  const expire = Number(new URL(url).searchParams.get('expire'));
  return Number.isFinite(expire) && expire > 0
    ? expire * 1000 - 5 * 60_000
    : Date.now() + 5 * 60 * 60_000; // fallback of 5 hours if there is no given expiry
}

/**
 * Runs ytdlp looking for the video with the given youtube reference returns the info and
 * the media links separately.
 * @param ref the youtube video id
 */
export async function probe(ref: string): Promise<YoutubeProbe> {
  const info = await runYtDlp(ref);
  const live = info.is_live === true;
  const [video, audio] = info.requested_formats ?? [];

  if (!video?.url || !audio?.url) {
    throw new HttpError(422, 'could not resolve separate video and audio streams');
  }

  return {
    stream: {
      title: info.title ?? 'Unknown',
      duration: live ? null : (info.duration ?? null),
      features: {
        seekable: !live,
        hasDuration: !live && typeof info.duration === 'number',
        live,
      },
    },
    media: {
      videoUrl: video.url,
      audioUrl: audio.url,
      headers: video.http_headers ?? {},
      expiresAt: Math.min(expiryOf(video.url), expiryOf(audio.url)),
    },
  };
}

export function ffmpegInputArgs(media: YoutubeMedia, position: number): string[] {
  const pos = String(position);

  const { 'User-Agent': userAgent, ...rest } = media.headers;
  const extra = Object.entries(rest)
    .map(([key, value]) => `${key}: ${value}\r\n`)
    .join('');
  const head = [
    ...(userAgent ? ['-user_agent', userAgent] : []),
    ...(extra ? ['-headers', extra] : []),
  ];

  // prettier-ignore
  const input = [
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
    ...head,
    '-thread_queue_size', '512',
    '-re',
    '-readrate_initial_burst', '5',
  ];

  // prettier-ignore
  return [
    ...input, '-ss', pos, '-i', media.videoUrl,
    ...input, '-ss', pos, '-i', media.audioUrl,
    '-map', '0:v', '-map', '1:a',
  ];
}
