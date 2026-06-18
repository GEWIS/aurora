import dataSource from '../../database';
import {
  LightsGroup,
  LightsGroupMovingHeadRgbs,
  LightsGroupMovingHeadWheels,
  LightsGroupPars,
} from '../lights/entities';
import HandlerManager from './handler-manager';
import { DEFAULT_MASTER_DIMMER } from '../lights/entities/lights-group-fixture';

export default class RootLightsOperationsService {
  /**
   * Get all lights groups that are present in memory
   */
  public getGroups(): LightsGroup[] {
    const manager = HandlerManager.getInstance();
    return manager
      .getHandlers(LightsGroup)
      .map((handler) => handler.entities)
      .flat() as LightsGroup[];
  }

  /**
   * Set the master dimmer for all fixtures in a group, both in-memory and in the database
   * @param id
   * @param masterRelativeBrightness
   */
  public async applyLightsGroupRelativeBrightness(id: number, masterRelativeBrightness: number) {
    // Apply the master relative brightness to the existing in-memory fixtures
    const memGroup = this.getGroups().find((g) => g.id === id);
    if (memGroup) {
      memGroup.fixtures.forEach((f) => {
        // TODO: refactor to not manually update valuesUpdatedAt outside entities
        f.masterRelativeBrightness = masterRelativeBrightness;
        f.fixture.valuesUpdatedAt = new Date();
      });
    }

    const dbLightsGroup = await dataSource.getRepository(LightsGroup).findOne({
      where: { id },
      relations: { pars: true, movingHeadRgbs: true, movingHeadWheels: true },
    });
    if (!dbLightsGroup) return;

    // Store the master brightness in the database, in case a lights group switches handlers
    if (dbLightsGroup.pars.length > 0)
      await dataSource.getRepository(LightsGroupPars).update(
        dbLightsGroup.pars.map((p) => p.id),
        { masterRelativeBrightness },
      );
    if (dbLightsGroup.movingHeadRgbs.length > 0)
      await dataSource.getRepository(LightsGroupMovingHeadRgbs).update(
        dbLightsGroup.movingHeadRgbs.map((p) => p.id),
        { masterRelativeBrightness },
      );
    if (dbLightsGroup.movingHeadWheels.length > 0)
      await dataSource.getRepository(LightsGroupMovingHeadWheels).update(
        dbLightsGroup.movingHeadWheels.map((p) => p.id),
        { masterRelativeBrightness },
      );
  }

  /**
   * Reset master dimmer for given lights group to default
   * @param id
   */
  public async resetLightsGroupRelativeBrightness(id: number) {
    return this.applyLightsGroupRelativeBrightness(id, DEFAULT_MASTER_DIMMER);
  }
}
