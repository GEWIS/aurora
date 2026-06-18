import EffectsHandler, { GroupEffectsMap } from './effects-handler';
import { LightsGroup } from '../../lights/entities';
import { LightsEffectBuilder } from '../../lights/effects/lights-effect';
import { LIGHTS_EFFECTS, LightsEffectsCreateParams } from '../../lights/effects';
import { LightsEffectsColorCreateParams } from '../../lights/effects/color';
import { LightsEffectsMovementCreateParams } from '../../lights/effects/movement';
import { RgbColor } from '../../lights/color-definitions';

export default class SetEffectsHandler extends EffectsHandler {
  /**
   * Attach the given effect to the given lightsGroup
   * @param lightsGroup
   * @param effects
   * @param effectsMap
   */
  private setEffect(
    lightsGroup: LightsGroup,
    effects: LightsEffectBuilder[],
    effectsMap: GroupEffectsMap,
  ) {
    this.destroyEffect(effectsMap.get(lightsGroup));
    effectsMap.set(
      lightsGroup,
      effects.map((e) => e(lightsGroup)),
    );
  }

  /**
   * Remove any existing effects from the lightsGroup. Will default to blackout
   * @param lightsGroup
   * @param effectsMap
   */
  private removeEffect(lightsGroup: LightsGroup, effectsMap: GroupEffectsMap) {
    lightsGroup.blackout();
    this.destroyEffect(effectsMap.get(lightsGroup));
    effectsMap.set(lightsGroup, null);
  }

  /**
   * Given a list of effects to create, add the given effects to the given
   * lightsgroup. Remove all effects if an empty array is given
   * @param id
   * @param effects
   * @param effectsMap
   */
  private parseAndSetEffects(
    id: number,
    effects: LightsEffectsCreateParams[],
    effectsMap: GroupEffectsMap,
  ) {
    const lightsGroup = this.entities.find((e) => e.id === id);
    if (lightsGroup === undefined)
      throw new Error(`LightsGroup with ID ${id} is not registered to this handler.`);

    if (effects.length === 0) {
      this.removeEffect(lightsGroup, effectsMap);
      return;
    }

    const effectBuilders = effects.map(
      (effect) =>
        LIGHTS_EFFECTS.map((EFFECT) => {
          if (EFFECT.name === effect.type) {
            // @ts-ignore No idea how to do this properly with Typescript
            return EFFECT.build(effect.props);
          }
          return undefined;
        })
          .filter((e) => e !== undefined)
          .map((e) => e!)
          .flat()[0],
    );

    this.setEffect(lightsGroup, effectBuilders, effectsMap);
  }

  public setColorEffect(lightsGroup: LightsGroup, effects: LightsEffectBuilder[]) {
    return this.setEffect(lightsGroup, effects, this.groupColorEffects);
  }

  public removeColorEffect(lightsGroup: LightsGroup) {
    return this.removeEffect(lightsGroup, this.groupColorEffects);
  }

  public parseAndSetColorEffects(id: number, effects: LightsEffectsColorCreateParams[]) {
    return this.parseAndSetEffects(id, effects, this.groupColorEffects);
  }

  public setMovementEffect(lightsGroup: LightsGroup, effects: LightsEffectBuilder[]) {
    return this.setEffect(lightsGroup, effects, this.groupMovementEffects);
  }

  public removeMovementEffect(lightsGroup: LightsGroup) {
    return this.removeEffect(lightsGroup, this.groupMovementEffects);
  }

  public parseAndSetMovementEffects(id: number, effects: LightsEffectsMovementCreateParams[]) {
    return this.parseAndSetEffects(id, effects, this.groupMovementEffects);
  }
}
