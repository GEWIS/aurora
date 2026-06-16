import { LIGHTS_EFFECTS } from '../../lights/effects';
import { LightsGroup } from '../../lights/entities';

/**
 * Parse a database-stored effect into an actual effect object
 * @param lightsGroup Group this effect should apply to
 * @param effectName Name of the effect
 * @param effectProps JSON-stringified props of the effect
 * @constructor
 */
export function databaseEffectToObject(
  lightsGroup: LightsGroup,
  effectName: string,
  effectProps: string,
) {
  const props = JSON.parse(effectProps);
  return LIGHTS_EFFECTS.map((EFFECT) => {
    if (EFFECT.name === effectName) {
      return new EFFECT(lightsGroup, props);
    }
    return undefined;
  })
    .filter((e) => e !== undefined)
    .map((e) => e!)
    .flat()[0];
}
