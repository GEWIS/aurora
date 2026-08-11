import BaseScreenHandler from '../../base-screen-handler';
import VideostreamService from './videostream-service';
import { HttpApiException, HttpStatusCode } from '../../../../helpers/custom-error';
import logger from '../../../../logger';
import Screen from '../../../root/entities/screen';

export type VideostreamPhase = 'idle' | 'ready' | 'playing' | 'paused' | 'error';

export interface VideostreamHandlerState {
  phase: VideostreamPhase;
  ref: string | null;

  title: string | null;
  duration: number | null;
  seekable: boolean;

  whepUrl: string | null;

  startEpoch: number | null;
  pausedAt: number | null;

  /** Why playback stopped on its own, set only in the error phase */
  error: string | null;
}

const IDLE_VIDEOSTREAM_STATE: VideostreamHandlerState = {
  phase: 'idle',
  ref: null,
  title: null,
  duration: null,
  seekable: false,
  whepUrl: null,
  startEpoch: null,
  pausedAt: null,
  error: null,
};

const UPDATE_STREAM_EVENT_NAME = 'update_video_stream';

/** How often we check that the sidecar is still publishing while we think it is */
const WATCHDOG_INTERVAL_MS = 5_000;

export default class VideostreamHandler extends BaseScreenHandler {
  private state: VideostreamHandlerState = { ...IDLE_VIDEOSTREAM_STATE };

  private service = new VideostreamService();

  private watchdog?: NodeJS.Timeout;

  /**
   * The sidecar drops the stream by itself when its encoder dies, so nothing tells us
   * playback ended. Poll while playing, and surface it as an error phase so screens
   * stop waiting on a WHEP endpoint that will never produce bytes.
   * @private
   */
  private startWatchdog(): void {
    this.stopWatchdog();

    this.watchdog = setInterval(() => {
      if (this.state.phase !== 'playing') return;

      this.service
        .publisherStatus()
        .then(({ running, lastError }) => {
          if (running || this.state.phase !== 'playing') return;

          this.stopWatchdog();
          this.patch({
            phase: 'error',
            error: lastError ?? 'playback stopped unexpectedly',
            startEpoch: null,
            pausedAt: null,
          });
        })
        .catch((e) => logger.error(e));
    }, WATCHDOG_INTERVAL_MS);

    this.watchdog.unref();
  }

  private stopWatchdog(): void {
    if (!this.watchdog) return;

    clearInterval(this.watchdog);
    this.watchdog = undefined;
  }

  beat(): void {}
  changeTrack(): void {}

  getState(): VideostreamHandlerState {
    return this.state;
  }

  /**
   * Tell the sidecar to tear down its encoder if it is still publishing.
   * @private
   */
  private stopIfPublishing(): void {
    if (this.state.phase !== 'playing' && this.state.phase !== 'paused') return;
    this.service.stop().catch((e) => logger.error(e));
  }

  /**
   * Stop publishing once the last screen using this handler has gone away,
   * otherwise the encoder keeps running with nobody watching.
   * @param entity
   */
  removeEntity(entity: Screen): void {
    super.removeEntity(entity);
    if (this.entities.length > 0) return;

    this.stopWatchdog();
    this.stopIfPublishing();
    this.state = { ...IDLE_VIDEOSTREAM_STATE };
  }

  reset() {
    super.reset();
    this.stopWatchdog();
    this.stopIfPublishing();
    this.state = { ...IDLE_VIDEOSTREAM_STATE };
    this.sendEvent(UPDATE_STREAM_EVENT_NAME, this.getState());
  }

  private patch(changes: Partial<VideostreamHandlerState>): void {
    this.state = { ...this.state, ...changes };
    this.sendEvent(UPDATE_STREAM_EVENT_NAME, this.getState());
  }

  /**
   * Resolve a media URL into a playable stream, without starting playback
   * @param videoUrl
   */
  async resolve(videoUrl: string): Promise<VideostreamHandlerState> {
    const resolved = await this.service.resolve(videoUrl);

    this.patch({
      phase: 'ready',
      ref: resolved.ref,
      title: resolved.title,
      duration: resolved.duration,
      seekable: resolved.seekable,
      whepUrl: resolved.whepUrl,
      startEpoch: null,
      pausedAt: null,
      error: null,
    });

    return this.getState();
  }

  /**
   * Start playing the resolved stream from the given offset
   * @param position seconds into the media
   */
  async play(position = 0): Promise<VideostreamHandlerState> {
    const { ref } = this.state;
    if (!ref) {
      throw new HttpApiException(HttpStatusCode.Conflict, 'No stream has been resolved.');
    }

    await this.service.play(ref, position);
    this.startWatchdog();
    this.patch({
      phase: 'playing',
      startEpoch: Date.now() - position * 1000,
      pausedAt: null,
      error: null,
    });

    return this.getState();
  }

  /**
   * Stop playback and return to the ready state
   */
  async stop(): Promise<VideostreamHandlerState> {
    const { phase } = this.state;
    if (phase !== 'playing' && phase !== 'paused') {
      throw new HttpApiException(HttpStatusCode.Conflict, 'Nothing is playing.');
    }

    this.stopWatchdog();
    await this.service.stop();
    this.patch({ phase: 'ready', startEpoch: null, pausedAt: null, error: null });

    return this.getState();
  }

  /**
   * Pause playback by tearing down the encoder, remembering where we were
   */
  async pause(): Promise<VideostreamHandlerState> {
    const { phase, startEpoch } = this.state;
    if (phase !== 'playing' || startEpoch === null) {
      throw new HttpApiException(HttpStatusCode.Conflict, 'Nothing is playing.');
    }

    this.stopWatchdog();
    await this.service.stop();
    this.patch({ phase: 'paused', pausedAt: Date.now() });

    return this.getState();
  }

  /**
   * Resume a paused stream from where it left off
   */
  async resume(): Promise<VideostreamHandlerState> {
    const { phase, startEpoch, pausedAt } = this.state;
    if (phase !== 'paused' || startEpoch === null || pausedAt === null) {
      throw new HttpApiException(HttpStatusCode.Conflict, 'Nothing is paused.');
    }

    return this.play((pausedAt - startEpoch) / 1000);
  }

  /**
   * Jump to the given offset, restarting the stream there
   * @param position seconds into the media
   */
  async seek(position: number): Promise<VideostreamHandlerState> {
    if (!this.state.seekable) {
      throw new HttpApiException(HttpStatusCode.Conflict, 'This stream cannot be seeked.');
    }

    return this.play(position);
  }
}
