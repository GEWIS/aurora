import { BeatEvent } from '../../events/music-emitter-events';
import { LightsGroup } from '../entities';
import EffectProgressionStrategy from './progression-strategies/effect-progression-strategy';
import LightsGroupFixture from '../entities/lights-group-fixture';
import { LightsEffectDirection, LightsEffectPattern } from './lights-effect-pattern';
import EffectProgressionMapStrategy from './progression-strategies/mappers/effect-progression-map-strategy';
import EffectProgressionMapFactory from './progression-strategies/mappers/effect-progression-map-factory';
import { RgbColor } from '../color-definitions';

export type LightsEffectBuilder<P = {}, T extends LightsEffect<P> = LightsEffect<P>> = (
  lightsGroup: LightsGroup,
) => T;

export interface BaseLightsEffectProps {
  /**
   * One or more colors that should be shown
   */
  colors: RgbColor[];
}

export interface BaseLightsEffectProgressionProps {
  /**
   * 2D pattern for this effect. Defaults to "HORIZONTAL"
   */
  pattern?: LightsEffectPattern;

  /**
   * Direction of this effect. Defaults to "FORWARDS"
   */
  direction?: LightsEffectDirection;
}

export type BaseLightsEffectCreateParams = {};

export default abstract class LightsEffect<P = {}> {
  protected props: P;

  protected constructor(
    public readonly lightsGroup: LightsGroup,
    private readonly progressionStrategy?: EffectProgressionStrategy,
    private readonly progressionMapperStrategy?: EffectProgressionMapStrategy,
    private patternDirection = LightsEffectDirection.FORWARDS,
  ) {}

  public setNewProps(props: P) {
    this.props = props;
  }

  protected getEffectNrFixtures(): number {
    if (this.progressionMapperStrategy) return this.progressionMapperStrategy.getNrFixtures();
    return (
      this.lightsGroup.pars.length +
      this.lightsGroup.movingHeadWheels.length +
      this.lightsGroup.movingHeadRgbs.length
    );
  }

  protected getProgression(currentTick: Date, fixture: LightsGroupFixture): number {
    if (!this.progressionStrategy) return 0;

    let progression = 1 - this.progressionStrategy.getProgression(currentTick);
    if (this.patternDirection === LightsEffectDirection.BACKWARDS) {
      progression = 1 - progression;
    }

    if (this.progressionMapperStrategy) {
      return this.progressionMapperStrategy.getProgression(progression, fixture);
    }
    return this.progressionStrategy.getProgression(currentTick);
  }

  /**
   * Update the colors of the effect, if applicable.
   * Intended to be overriden by any effect that
   * uses colors
   * @param colors
   */
  public setColors(colors: RgbColor[]): void {}

  /**
   * Clean up effect when it is destroyed
   */
  abstract destroy(): void;

  /**
   * Process the tick in the effect's progression
   */
  public tick(): LightsGroup {
    this.progressionStrategy?.tick();
    return this.lightsGroup;
  }

  /**
   * Process the beat in the effect's progression
   * @param event
   */
  public beat(event: BeatEvent): void {
    this.progressionStrategy?.beat(event);
  }
}
