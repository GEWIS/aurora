import LightsEffect, { BaseLightsEffectProgressionProps } from '../lights-effect';
import { LightsGroup, LightsMovingHeadRgb, LightsMovingHeadWheel } from '../../entities';
import { EffectProgressionTickStrategy } from '../progression-strategies';
import { BeatEvent } from '../../../events/music-emitter-events';
import EffectProgressionMapFactory from '../progression-strategies/mappers/effect-progression-map-factory';

export interface BaseRotateProps {
  /**
   * Time for the moving head to go around (in milliseconds)
   * @isInt must be an integer
   * @minimum 0 must be positive
   */
  cycleTime?: number;

  /**
   * What phase the lights should move apart from each other. 0 for synchronous
   */
  offsetFactor?: number;
}

/**
 * Base movement effect that implements all logic required to make a moving head
 * rotate in a certain pattern. The pattern can be easily defined using the
 * setPosition() function.
 */
export default abstract class BaseRotate<T extends BaseRotateProps> extends LightsEffect<T> {
  protected constructor(
    lightsGroup: LightsGroup,
    protected readonly defaults: Required<BaseRotateProps>,
    progressionProps: BaseLightsEffectProgressionProps,
    cycleTime?: number,
  ) {
    super(lightsGroup, new EffectProgressionTickStrategy(cycleTime ?? defaults.cycleTime));
  }

  /**
   * Set the pan/tilt of the current moving head
   * @param movingHead
   * @param progression Progression within the effect, [0, 1)
   * @param offset Offset factor applied only to this moving head
   * @protected
   */
  protected abstract setPosition(
    movingHead: LightsMovingHeadWheel | LightsMovingHeadRgb,
    progression: number,
    offset: number,
  ): void;

  destroy(): void {
    [...this.lightsGroup.movingHeadRgbs, ...this.lightsGroup.movingHeadWheels].forEach((f) => {
      f.fixture.movement.reset();
    });
  }

  beat(event: BeatEvent): void {
    super.beat(event);
  }

  tick(): LightsGroup {
    const currentTick = new Date();
    const offsetFactor = this.props.offsetFactor ?? this.defaults.offsetFactor;

    this.lightsGroup.movingHeadWheels.forEach((m, i) => {
      const progression = this.getProgression(currentTick, m);
      this.setPosition(m.fixture, progression, i * offsetFactor * 2 * Math.PI);
    });

    this.lightsGroup.movingHeadRgbs.forEach((m, i) => {
      const progression = this.getProgression(currentTick, m);
      const index = i + this.lightsGroup.movingHeadWheels.length;
      this.setPosition(m.fixture, progression, index * offsetFactor * 2 * Math.PI);
    });

    super.tick();
    return this.lightsGroup;
  }
}
