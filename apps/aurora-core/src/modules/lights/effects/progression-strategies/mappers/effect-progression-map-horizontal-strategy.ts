import EffectProgressionMapStrategy from './effect-progression-map-strategy';
import LightsGroupFixture from '../../../entities/lights-group-fixture';

export default class EffectProgressionMapHorizontalStrategy extends EffectProgressionMapStrategy {
  public getNrFixtures(): number {
    return this.lightsGroup.gridSizeX * this.multiplier;
  }

  public getProgression(progression: number, fixture: LightsGroupFixture): number {
    const relativePosition = fixture.positionX / this.getNrFixtures();
    return (relativePosition + progression) % 1;
  }
}
