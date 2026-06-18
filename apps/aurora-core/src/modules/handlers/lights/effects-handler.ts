import BaseLightsHandler from '../base-lights-handler';
import { LightsGroup } from '../../lights/entities';
import LightsEffect from '../../lights/effects/lights-effect';
import { BeatEvent } from '../../events/music-emitter-events';
import { RgbColor } from '../../lights/color-definitions';

export type GroupEffectsMap = Map<LightsGroup, LightsEffect | LightsEffect[] | null>;

export default abstract class EffectsHandler extends BaseLightsHandler {
  /**
   * Assign every group of lights zero or more color effects
   */
  protected groupColorEffects: GroupEffectsMap = new Map();

  /**
   * Assign every group of lights zero or more movement effects
   */
  protected groupMovementEffects: GroupEffectsMap = new Map();

  // Override entity register function to also populate the groupEffect mapping
  public registerEntity(entity: LightsGroup) {
    super.registerEntity(entity);
    this.groupColorEffects.set(entity, null);
    this.groupMovementEffects.set(entity, null);
  }

  /**
   * Call the destroy method on a (set of) effects, if it exists
   * @param effect
   * @private
   */
  public destroyEffect(effect: LightsEffect | LightsEffect[] | null | undefined) {
    if (effect == null) return;
    if (Array.isArray(effect)) {
      effect.forEach((e) => e.destroy());
    } else {
      effect.destroy();
    }
  }

  /**
   * Given an entity, destroy and clear all effects assigned to this entity
   * @param entityCopy
   * @private
   */
  public clearEffect(entityCopy: LightsGroup) {
    const entity: LightsGroup | undefined = this.entities.find((e) => e.id === entityCopy.id);
    if (!entity) return;

    this.destroyEffect(this.groupColorEffects.get(entity));
    this.groupColorEffects.set(entity, null);
    this.destroyEffect(this.groupMovementEffects.get(entity));
    this.groupMovementEffects.set(entity, null);
  }

  // We should also remove the entity from the effects mapping
  public removeEntity(entityCopy: LightsGroup) {
    const entity: LightsGroup | undefined = this.entities.find((e) => e.id === entityCopy.id);
    if (!entity) return;

    this.clearEffect(entity);

    this.groupColorEffects.delete(entity);
    this.groupMovementEffects.delete(entity);
    super.removeEntity(entity);
  }

  tick(): LightsGroup[] {
    this.groupColorEffects.forEach((effect, group) => {
      if (effect == null) {
        // Only blackout if the group also has no movement effects. Do nothing otherwise
        if (!this.groupMovementEffects.has(group)) {
          group.blackout();
        }
      } else if (Array.isArray(effect)) {
        effect.forEach((e) => e.tick());
      } else {
        effect.tick();
      }
    });
    this.groupMovementEffects.forEach((effect) => {
      if (effect == null) {
        // No movement does not mean a blackout, because the fixture can be a par
        return;
      }
      if (Array.isArray(effect)) {
        effect.forEach((e) => e.tick());
      } else {
        effect.tick();
      }
    });

    return this.entities;
  }

  beat(event: BeatEvent) {
    // Propagate the beat to every effect
    this.groupColorEffects.forEach((effect) => {
      if (!effect) return;
      if (Array.isArray(effect)) {
        effect.forEach((e) => e.beat(event));
      } else {
        effect.beat(event);
      }
    });
    // Propagate the beat to every effect
    this.groupMovementEffects.forEach((effect) => {
      if (!effect) return;
      if (Array.isArray(effect)) {
        effect.forEach((e) => e.beat(event));
      } else {
        effect.beat(event);
      }
    });
  }

  /**
   * Change the color of the given lights group's effects
   * @param entityCopy
   * @param colors
   */
  updateColors(entityCopy: LightsGroup, colors: RgbColor[]): void {
    const entity: LightsGroup | undefined = this.entities.find((e) => e.id === entityCopy.id);
    if (!entity) return;

    const effect = this.groupColorEffects.get(entity);
    if (Array.isArray(effect)) {
      effect.forEach((e) => e.setColors(colors));
    } else {
      effect?.setColors(colors);
    }
  }

  /**
   * Change the color of the effects of the lights group with the given ID
   * @param id
   * @param colors
   */
  updateColorsById(id: number, colors: RgbColor[]): void {
    const entity: LightsGroup | undefined = this.entities.find((e) => e.id === id);
    if (!entity) return;

    this.updateColors(entity, colors);
  }
}
