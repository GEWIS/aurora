import { Namespace } from 'socket.io';
import BaseAudioHandler from '../base-audio-handler';
import { MusicEmitter } from '../../events';
import logger from '../../../logger';

export default class SimpleAudioHandler extends BaseAudioHandler {
  private socket: Namespace;

  private onSyncAudioTimings: ((params: { startTime: number; timestamp: number }) => void)[] = [];

  constructor(socket: Namespace, musicEmitter: MusicEmitter) {
    super(musicEmitter);
    this.socket = socket;

    this.socket.on('connection', (sc) => {
      sc.on('sync_audio_timings', (params: { startTime: number; timestamp: number }) => {
        logger.debug(`Sync audio timings: ${params.startTime - params.timestamp}`);
        this.onSyncAudioTimings.forEach((h) => h(params));
      });
    });
  }

  /**
   * Add an audio sync timing handler function
   * @param handler
   */
  public addSyncAudioTimingHandler(
    handler: (params: { startTime: number; timestamp: number }) => void,
  ) {
    this.onSyncAudioTimings.push(handler);
  }

  /**
   * Remove an audio sync timing handler function
   * @param handler
   */
  public removeSyncAudioTimingHandler(
    handler: (params: { startTime: number; timestamp: number }) => void,
  ) {
    this.onSyncAudioTimings = this.onSyncAudioTimings.filter((h) => h === handler);
  }

  /**
   * Start playing audio. Optionally provide a callback function that is called
   * once the listener starts playing audio. It will then provide the time in ms
   * since epoch at which audio started playing (listener machine time)
   * @param url Audio file URL
   * @param startTime Timestamp in seconds the audio should start playing at
   */
  public play(url: string, startTime?: number) {
    this.socket.emit('play_audio', url, startTime);
  }

  public stop() {
    this.socket.emit('stop_audio');
  }

  /**
   * Set playback to a certain point in time (fast-forward or revert)
   */
  public setPlayback(seconds: number) {
    this.socket.emit('skip_to', seconds);
  }
}
