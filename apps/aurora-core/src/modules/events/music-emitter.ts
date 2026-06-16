import { BaseEventEmitter } from './base-event-emitter';
import BaseAudioHandler from '../handlers/base-audio-handler';
import { TrackChangeEvent } from './music-emitter-events';

export class MusicEmitter extends BaseEventEmitter {
  private audioHandlers: BaseAudioHandler[] = [];

  private currentlyPlaying: TrackChangeEvent[] | null;

  public registerAudioHandler(handler: BaseAudioHandler) {
    this.audioHandlers.push(handler);
  }

  /**
   * Emit Spotify-related events. Blocked when an audio entity is playing audio
   * Beat events are blocked when the artificial beat generator is enabled
   * @param eventName
   * @param args
   */
  public emitSpotify(eventName: string, ...args: any[]) {
    this.forwardOnAudioNotPlaying(eventName, ...args);
  }

  /**
   * Emit general audio events. Never blocked
   * @param eventName
   * @param args
   */
  public emitAudio(eventName: string, ...args: any[]) {
    this.forward(eventName, ...args);
  }

  /**
   * Emit the given event when no audio device is playing any audio
   * @param eventName
   * @param args
   * @private
   */
  private forwardOnAudioNotPlaying(eventName: string, ...args: any[]) {
    const someAudioPlaying = this.audioHandlers.some((h) => h.entities.some((a) => a.playing));
    if (someAudioPlaying) return;
    this.forward(eventName, ...args);
  }

  /**
   * Emit event and cache the currently playing track
   * @param eventName
   * @param args
   * @private
   */
  private forward(eventName: string, ...args: any[]) {
    this.emit(eventName, ...args);
    if (eventName === 'change_track') {
      [this.currentlyPlaying] = args;
    } else if (eventName === 'stop') {
      this.currentlyPlaying = null;
    }
  }

  get getCurrentlyPlayingTrack() {
    return this.currentlyPlaying;
  }
}
