import BaseLightsHandler from '../base-lights-handler';
import { BeatEvent } from '../../events/music-emitter-events';
import { LightsGroup } from '../../lights/entities';
import SetEffectsHandler from './set-effects-handler';
import RandomEffectsHandler from './random-effects-handler';
import { StaticColor } from '../../lights/effects/color';
import { RgbColor } from '../../lights/color-definitions';

export default class TimeTrailRaceLightsHandler extends BaseLightsHandler {
  private setEffectsHandler = new SetEffectsHandler();

  private randomEffectsHandler = new RandomEffectsHandler();

  /**
   * Party mode, handled by RandomEffectsHandler
   */
  setLightsToParty() {
    this.setEffectsHandler.entities.forEach((e) => {
      this.setEffectsHandler.removeEntity(e);
    });

    this.entities.forEach((e) => {
      this.randomEffectsHandler.registerEntity(e);
    });
  }

  /**
   * Set all lights to white and disable any moving heads
   */
  setLightsToWhite() {
    this.randomEffectsHandler.entities.forEach((e) => {
      this.randomEffectsHandler.removeEntity(e);
    });

    this.entities.forEach((e) => {
      this.setEffectsHandler.registerEntity(e);
    });

    const effect = StaticColor.build({ color: RgbColor.WHITE });
    this.entities.forEach((e) => {
      if (e.movingHeadWheels.length > 0 || e.movingHeadRgbs.length > 0) return;
      this.setEffectsHandler.setColorEffect(e, [effect]);
    });
  }

  beat(event: BeatEvent): void {
    this.setEffectsHandler.beat(event);
    this.randomEffectsHandler.beat(event);
  }

  tick(): LightsGroup[] {
    this.setEffectsHandler.tick();
    this.randomEffectsHandler.tick();
    return this.entities;
  }
}
