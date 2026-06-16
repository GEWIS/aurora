import { BeatEvent } from 'src/modules/events/music-emitter-events';
import { LightsGroup } from '../../entities';
import EffectProgressionStrategy from './effect-progression-strategy';

export default class EffectProgressionTickStrategy extends EffectProgressionStrategy {
  private cycleStartTick: Date = new Date();

  constructor(
    private cycleTime: number,
    private singleCycle = false,
  ) {
    super();
  }

  getProgression(currentTick: Date): number {
    return Math.min(1, (currentTick.getTime() - this.cycleStartTick.getTime()) / this.cycleTime);
  }

  tick(): void {
    const currentTick = new Date();
    const progression = this.getProgression(currentTick);
    if (progression >= 1 && !this.singleCycle) {
      this.cycleStartTick = currentTick;
    }
  }
  beat(event: BeatEvent): void {}
}
