import EffectProgressionMapStrategy from './effect-progression-map-strategy';
import LightsGroupFixture from '../../../entities/lights-group-fixture';

export default class EffectProgressionMapCenteredSquaredStrategy extends EffectProgressionMapStrategy {
  public getNrFixtures(): number {
    return Math.round((this.lightsGroup.gridSizeX + this.lightsGroup.gridSizeY) / 2) - 1;
  }

  public getProgression(progression: number, fixture: LightsGroupFixture): number {
    const { x: centerX, y: centerY } = this.getCenter();

    const distanceX = Math.abs(fixture.positionX - centerX);
    const distanceY = Math.abs(fixture.positionY - centerY);
    const relativePosition = (distanceX + distanceY) / this.getNrFixtures();

    return (relativePosition + progression) % 1;
  }
}
