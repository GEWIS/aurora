import { BeatEvent } from '../events';
import { BeatGenerator } from './beat-generator';

export interface ArtificialBeatGeneratorParams {
  /**
   * Beats per minute
   * @minimum 1 Should be positive and not null
   */
  bpm: number;
}

export class SimpleBeatGenerator extends BeatGenerator {
  private beatStart: Date | undefined;

  public bpm: number;

  private beatInterval: number;

  private interval: NodeJS.Timeout;

  constructor(id: string, name: string, bpm: number) {
    super(id, name);
    this.bpm = bpm;
  }

  /**
   * Whether the generator is generating and transmitting beats
   */
  get active() {
    return this.beatStart !== undefined;
  }

  /**
   * Restart the beat generator, so the next beat will be right now.
   */
  public restart(): void {
    this.start();
  }

  /**
   * Update the bpm (transmits a new beat on call)
   * @param bpm
   */
  public setBpm(bpm: number): void {
    this.bpm = bpm;
    this.start();
  }

  /**
   * Start the beat generator
   */
  public start() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    if (!this.beatStart) {
      this.beatStart = new Date();
    }

    this.beatInterval = Math.round(60000 / this.bpm);
    this.interval = setInterval(this.emitBeat.bind(this), this.beatInterval);
    this.emitBeat();
  }

  /**
   * Emit a beat to the music emitter. Confidence is always 0.5 because it's an artificial beat
   * @private
   */
  protected emitBeat() {
    if (!this.beatStart) return;

    const event: BeatEvent = {
      beat: {
        start: (new Date().getTime() - this.beatStart.getTime()) / 1000,
        duration: this.beatInterval,
        confidence: 0.5,
      },
    };

    this.sendBeat(event);
  }

  destroy() {
    clearInterval(this.interval);
  }
}
