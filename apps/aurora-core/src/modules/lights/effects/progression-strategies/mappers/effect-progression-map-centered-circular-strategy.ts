import EffectProgressionMapStrategy from './effect-progression-map-strategy';
import LightsGroupFixture from '../../../entities/lights-group-fixture';

export default class EffectProgressionMapCenteredCircularStrategy extends EffectProgressionMapStrategy {
  getNrFixtures(): number {
    const { x: centerX, y: centerY } = this.getCenter();

    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);

    return Math.ceil(maxDistance);
  }

  getProgression(progression: number, fixture: LightsGroupFixture): number {
    const { x: centerX, y: centerY } = this.getCenter();

    const distanceX = fixture.positionX - centerX;
    const distanceY = fixture.positionY - centerY;
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const relativePosition = Math.sqrt(distanceX ** 2 + distanceY ** 2) / maxDistance;

    return (relativePosition + progression) % 1;
  }
}
