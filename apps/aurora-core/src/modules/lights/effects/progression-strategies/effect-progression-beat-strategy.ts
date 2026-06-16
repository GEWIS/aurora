import { BeatEvent } from 'src/modules/events/music-emitter-events';
import EffectProgressionStrategy from './effect-progression-strategy';

export default class EffectProgressionBeatStrategy extends EffectProgressionStrategy {
  private phase = 0;

  /**
   * @param nrSteps Number of steps in the effect (integer)
   */
  constructor(private nrSteps: number) {
    super();
  }

  getProgression(currentTick: Date): number {
    return this.phase / this.nrSteps;
  }
  tick(): void {}

  beat(event: BeatEvent): void {
    this.phase = (this.phase + 1) % this.nrSteps;
  }
}
