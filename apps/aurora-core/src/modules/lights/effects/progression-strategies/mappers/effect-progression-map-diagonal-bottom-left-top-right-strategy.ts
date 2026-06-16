import EffectProgressionMapStrategy from './effect-progression-map-strategy';
import LightsGroupFixture from '../../../entities/lights-group-fixture';

export default class EffectProgressionMapDiagonalBottomLeftTopRightStrategy extends EffectProgressionMapStrategy {
  public getNrFixtures(): number {
    return this.lightsGroup.gridSizeX + this.lightsGroup.gridSizeY;
  }

  public getProgression(progression: number, fixture: LightsGroupFixture): number {
    const relativePosition = (fixture.positionX - fixture.positionY) / this.getNrFixtures();
    return (relativePosition + progression) % 1;
  }
}
