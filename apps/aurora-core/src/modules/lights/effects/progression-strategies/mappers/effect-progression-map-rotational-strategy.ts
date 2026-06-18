import EffectProgressionMapStrategy from './effect-progression-map-strategy';
import LightsGroupFixture from '../../../entities/lights-group-fixture';

export default class EffectProgressionMapRotationalStrategy extends EffectProgressionMapStrategy {
  public getNrFixtures(): number {
    return this.lightsGroup.gridSizeX * 2 + this.lightsGroup.gridSizeY * 2;
  }

  public getProgression(progression: number, fixture: LightsGroupFixture): number {
    const { x: centerX, y: centerY } = this.getCenter();

    const x = fixture.positionX - centerX;
    const y = fixture.positionY - centerY;
    const angle = Math.atan2(x, y) / Math.PI;
    // Transform range [-1, 1] to [0, 1]
    const relativePosition = (angle + 1) / 2;
    return (relativePosition + progression) % 1;
  }
}
