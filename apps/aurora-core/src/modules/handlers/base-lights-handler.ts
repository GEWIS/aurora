import BaseHandler from './base-handler';
import { LightsGroup } from '../lights/entities';

export default abstract class BaseLightsHandler extends BaseHandler<LightsGroup> {
  /**
   * Second event loop to calculate the current DMX values.
   * Always runs at a predefined frequency, defined in `LIGHTS_TICK_INTERVAL` (in Hz).
   */
  abstract tick(): LightsGroup[];

  public removeEntity(entity: LightsGroup) {
    // Reset all the lights
    entity.pars.forEach((f) => {
      f.fixture.blackout();
      f.fixture.clearOverrideDmx();
    });
    entity.movingHeadRgbs.forEach((f) => {
      f.fixture.blackout();
      f.fixture.clearOverrideDmx();
    });
    entity.movingHeadWheels.forEach((f) => {
      f.fixture.blackout();
      f.fixture.clearOverrideDmx();
    });

    super.removeEntity(entity);
  }
}
