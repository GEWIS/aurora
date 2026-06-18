import { LightsGroup } from '../../lights/entities';
import { BeatEvent } from '../../events';
import { BeatFadeOut, Sparkle, StaticColor, Wave } from '../../lights/effects/color';
import { getTwoComplementaryRgbColors, RgbColor } from '../../lights/color-definitions';
import EffectsHandler from './effects-handler';
import { SearchLight, TableRotate } from '../../lights/effects/movement';
import {
  getRandomLightsEffectDirection,
  getRandomLightsEffectPattern,
} from '../../lights/effects/lights-effect-pattern';

export default class RandomEffectsHandler extends EffectsHandler {
  private lastSectionStart: number = 0;

  private colors: RgbColor[] = getTwoComplementaryRgbColors().colorNames;

  private effectSwitchTimeout: NodeJS.Timeout | null = null;

  // Override entity register function to assign random effect
  public registerEntity(entity: LightsGroup) {
    // If this is the first entity for this handler, schedule the next effect switch
    if (this.entities.length === 0) this.scheduleNextEffectSwitch();

    super.registerEntity(entity);
    this.assignRandomEffect(entity);
  }

  public removeEntity(entityCopy: LightsGroup) {
    super.removeEntity(entityCopy);

    // If there are no more entities left, remove the effect switch
    if (this.entities.length === 0 && this.effectSwitchTimeout !== null) {
      clearTimeout(this.effectSwitchTimeout);
    }
  }

  private updateRandomColor() {
    const colors = getTwoComplementaryRgbColors();
    this.colors = colors.colorNames;
  }

  /**
   * Create a timeout that will change the effects on all entities.
   * Switch is between 20 and 40 seconds.
   * @private
   */
  private scheduleNextEffectSwitch() {
    // Clear any existing effect timeout if present
    if (this.effectSwitchTimeout !== null) clearTimeout(this.effectSwitchTimeout);

    const timeoutTime = Math.round(Math.random() * 20000 + 20000);
    this.effectSwitchTimeout = setTimeout(this.performEffectSwitch.bind(this), timeoutTime);
  }

  /**
   * Assign a new effect including new colors to all entities.
   * Also, schedule a new switch between 20 and 40 seconds from now.
   * @private
   */
  private performEffectSwitch() {
    // Remove the timeout, because it has fired.
    this.effectSwitchTimeout = null;

    this.updateRandomColor();
    this.entities.forEach((entity) => {
      this.assignRandomEffect(entity);
    });

    this.scheduleNextEffectSwitch();
  }

  /**
   * Assign a random effect with random colors to the given lights group
   * @param entity
   * @private
   */
  private assignRandomEffect(entity: LightsGroup) {
    // Destroy the existing effect(s)
    this.clearEffect(entity);

    const pattern = getRandomLightsEffectPattern();
    const direction = getRandomLightsEffectDirection();

    if (entity.movingHeadWheels.length === 0) {
      const random = Math.random();
      if (random < 0.8) {
        this.groupColorEffects.set(
          entity,
          new BeatFadeOut(entity, {
            colors: this.colors,
            enableFade: false,
            nrBlacks: 1,
            pattern,
            direction,
          }),
        );
      } else if (random < 0.9) {
        this.groupColorEffects.set(
          entity,
          new Wave(entity, { colors: this.colors, pattern, direction }),
        );
      } else {
        this.groupColorEffects.set(entity, new Sparkle(entity, { colors: this.colors }));
      }
    } else {
      this.groupColorEffects.set(entity, new StaticColor(entity, { color: RgbColor.WHITE }));
    }
    if (entity.groupInMiddle) {
      this.groupMovementEffects.set(entity, new SearchLight(entity, {}));
    } else {
      this.groupMovementEffects.set(entity, new TableRotate(entity, {}));
    }
  }

  beat(event: BeatEvent): void {
    // If we reach a new section in a song, assign a new effect
    if (event.section && event.section?.start !== this.lastSectionStart) {
      this.lastSectionStart = event.section?.start;
      this.updateRandomColor();
      this.entities.forEach((group) => {
        this.assignRandomEffect(group);
      });

      // Schedule a new effect timeout, because we have just switched.
      this.scheduleNextEffectSwitch();
    }

    super.beat(event);
  }
}
