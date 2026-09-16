import { LightsGroup } from '../../lights/entities';
import { LightsEffectBuilder } from '../../lights/effects/lights-effect';

/**
 * Applying light behaviour to the groups a mode has claimed.
 */
export default abstract class LightsControl {
  abstract get groups(): LightsGroup[];
  abstract setColorEffect(group: LightsGroup, effects: LightsEffectBuilder[]): void;
  abstract setMovementEffect(group: LightsGroup, effects: LightsEffectBuilder[]): void;
  abstract removeColorEffect(group: LightsGroup): void;
  abstract removeMovementEffect(group: LightsGroup): void;
}
