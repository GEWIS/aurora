import { LightsGroup } from '../../entities';
import { BeatEvent } from '../../../events/music-emitter-events';

export default abstract class EffectProgressionStrategy {
  /**
   * @returns The progression of the effect, as a float in the range [0, 1]
   */
  abstract getProgression(currentTick: Date): number;
  abstract tick(): void;
  abstract beat(event: BeatEvent): void;
}
