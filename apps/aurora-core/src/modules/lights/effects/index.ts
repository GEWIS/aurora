import { LIGHTS_EFFECTS_COLOR, LightsEffectsColorCreateParams } from './color';
import { LIGHTS_EFFECTS_MOVEMENT, LightsEffectsMovementCreateParams } from './movement';

export type LightsEffectsCreateParams =
  | LightsEffectsColorCreateParams
  | LightsEffectsMovementCreateParams;

export const LIGHTS_EFFECTS = [...LIGHTS_EFFECTS_COLOR, ...LIGHTS_EFFECTS_MOVEMENT];
