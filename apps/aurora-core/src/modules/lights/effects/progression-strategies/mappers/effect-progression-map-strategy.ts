import { LightsGroup } from '../../../entities';
import LightsGroupFixture from '../../../entities/lights-group-fixture';

export default abstract class EffectProgressionMapStrategy {
  constructor(
    protected lightsGroup: LightsGroup,
    protected multiplier = 1,
  ) {}

  protected getCenter(): { x: number; y: number } {
    return {
      x: (this.lightsGroup.gridSizeX - 1) / 2,
      y: (this.lightsGroup.gridSizeY - 1) / 2,
    };
  }

  public abstract getNrFixtures(): number;

  public abstract getProgression(progression: number, fixture: LightsGroupFixture): number;
}
