import { BaseEventEmitter } from './base-event-emitter';
import { MusicEmitter } from './music-emitter';
import { BeatEvent } from './music-emitter-events';
import { GeneratorBeatEvent } from './beat-emitter-events';

export class BeatEmitter extends BaseEventEmitter {
  constructor(private musicEmitter: MusicEmitter) {
    super();
  }

  /**
   * Transmit the beats that have precedence over all other beats
   * @param event
   */
  public beatPrecedence(event: BeatEvent) {
    this.musicEmitter.emitAudio('beat', event);
  }

  /**
   * Transmit a beat from a generator
   * @param event
   */
  public beat(event: GeneratorBeatEvent) {
    this.emit('beat', event);
  }
}
