import { PlaybackState, Track } from '@fostertheweb/spotify-web-sdk';
import SpotifyApiHandler from './spotify-api-handler';
import { MusicEmitter, TrackChangeEvent } from '../events';
import logger from '../../logger';

export default class SpotifyTrackHandler {
  private static instance: SpotifyTrackHandler;

  private initialized = false;

  private syncLoopTimer?: NodeJS.Timeout;

  private readonly api: SpotifyApiHandler;

  private playStateUpdateTime: Date = new Date();

  /** Currently playing state. Can be defined if not playing anything */
  private playState: PlaybackState | undefined;

  public musicEmitter: MusicEmitter;

  private constructor() {
    this.api = SpotifyApiHandler.getInstance();
    setInterval(this.syncLoop.bind(this), 5000);
    this.syncLoop().then(() => {});
  }

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new SpotifyTrackHandler();
    }
    return this.instance;
  }

  public async init(emitter: MusicEmitter) {
    if (this.initialized) throw new Error('SpotifyTrackHandler is already initialized!');
    this.musicEmitter = emitter;
    this.initialized = true;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  private asTrackChangeEvent(item: Track, state: PlaybackState): TrackChangeEvent {
    return {
      title: item.name,
      artists: item.artists.map((a) => a.name),
      cover: item.album.images[0]?.url,
      startTime: new Date(this.playStateUpdateTime.getTime() - state.progress_ms),
      trackURI: item.uri,
    };
  }

  /**
   * Try to pause Spotify playback
   */
  public pausePlayback() {
    if (!this.api.client || !this.playState || !this.playState.device || !this.playState.device.id)
      return;

    try {
      this.api.client?.player.pausePlayback(this.playState.device.id);
    } catch (e) {
      logger.fatal(e);
    }
  }

  /**
   * Try to resume Spotify playback on the same device as used before
   */
  public resumePlayback() {
    if (!this.api.client || !this.playState || !this.playState.device || !this.playState.device.id)
      return;

    try {
      this.api.client?.player.startResumePlayback(this.playState.device.id);
    } catch (e) {
      logger.fatal(e);
    }
  }

  private setNextTrackEvent(item: Track, state: PlaybackState): void {
    if (!state.is_playing) return;
    if (this.syncLoopTimer) {
      clearTimeout(this.syncLoopTimer);
      this.syncLoopTimer = undefined;
    }

    this.syncLoopTimer = setTimeout(
      this.syncLoop.bind(this),
      item.duration_ms - state.progress_ms + 10,
    );
  }

  /**
   * The playing item, but only when it is an actual track. Spotify returns a
   * null item for ads, and for episodes unless additional_types asks for them.
   */
  private static playingTrack(state: PlaybackState | undefined): Track | null {
    if (!state || state.currently_playing_type !== 'track') return null;
    return (state.item as Track | null) ?? null;
  }

  /**
   * Skips to the next track.
   */
  public async skipToNext() {
    if (
      !this.api.client ||
      !this.playState ||
      !this.playState.device ||
      !this.playState.device.id
    ) {
      logger.trace('Cannot skip to next track, no Spotify user or device');
      return;
    }

    await this.api.client?.player.skipToNext(this.playState.device.id);
  }

  /**
   * Main event loop to get the currently playing song
   * @private
   */
  private async syncLoop() {
    if (!this.api.client) return;

    let state: PlaybackState | undefined;
    try {
      state = await this.api.client.player.getCurrentlyPlayingTrack();
    } catch (e) {
      // Transient failures (e.g. a network blip reaching the Spotify API) are
      // expected; the loop retries on the next tick, so this is not fatal.
      logger.warn(`Spotify sync failed, will retry: ${String(e)}`);
      return;
    }

    this.playStateUpdateTime = new Date();

    // Advance the state before emitting, so a payload that trips up the event
    // building costs a single tick instead of wedging the loop on a stale track.
    const previous = this.playState;
    this.playState = state;

    const previousTrack = SpotifyTrackHandler.playingTrack(previous);
    const track = SpotifyTrackHandler.playingTrack(state);

    // If Spotify started playing a track, starts playing a new track or resumes playing audio...
    if (
      state &&
      track &&
      (!previous || previousTrack?.id !== track.id || (!previous.is_playing && state.is_playing))
    ) {
      this.setNextTrackEvent(track, state);

      this.musicEmitter.emitSpotify('change_track', [
        this.asTrackChangeEvent(track, state),
      ] as TrackChangeEvent[]);

      logger.info(
        `Now playing: ${track.artists.map((a) => a.name).join(', ')} - ${track.name} (${track.uri})`,
      );
    }

    // Ads and episodes keep is_playing true while carrying no track, so they
    // count as stopped rather than leaving the last track on screen.
    if ((!track || !state?.is_playing) && previousTrack && previous?.is_playing) {
      this.musicEmitter.emitSpotify('stop');
      logger.info('Spotify paused/stopped');
    }
  }
}
