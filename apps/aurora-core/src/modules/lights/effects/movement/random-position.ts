import LightsEffect, { BaseLightsEffectCreateParams, LightsEffectBuilder } from '../lights-effect';
import { LightsGroup } from '../../entities';
import { MovementEffects } from './movement-effetcs';

export interface RandomPositionProps {
  /**
   * After how many beats the light will move to a new position
   * @isInt
   * @minimum 0
   */
  beatsToMove?: number;
}

export type RandomPositionCreateParams = BaseLightsEffectCreateParams & {
  type: MovementEffects.RandomPosition;
  props: RandomPositionProps;
};

const DEFAULT_BEATS_TO_MOVE = 2;

export default class RandomPosition extends LightsEffect<RandomPositionProps> {
  private counters: number[];

  constructor(lightsGroup: LightsGroup, props: RandomPositionProps = {}) {
    super(lightsGroup);
    this.props = props;
    const count = lightsGroup.movingHeadRgbs.length + lightsGroup.movingHeadWheels.length;
    this.counters = new Array(count)
      .fill(0)
      .map((x, i) => i % (props.beatsToMove ?? DEFAULT_BEATS_TO_MOVE));
  }

  public static build(
    props: RandomPositionProps = {},
  ): LightsEffectBuilder<RandomPositionProps, RandomPosition> {
    return (lightsGroup) => new RandomPosition(lightsGroup, props);
  }

  beat(): void {
    const nrMHRgbs = this.lightsGroup.movingHeadRgbs.length;

    this.lightsGroup.movingHeadRgbs.forEach((m, i) => {
      if (this.counters[i] > 0) return;

      m.fixture.setPositionRel(Math.random() / 2, Math.random());
    });
    this.lightsGroup.movingHeadWheels.forEach((m, i) => {
      if (this.counters[nrMHRgbs + i] > 0) return;

      m.fixture.setPositionRel(Math.random() / 2, Math.random());
    });

    this.counters = this.counters.map(
      (c) => (c + 1) % (this.props.beatsToMove ?? DEFAULT_BEATS_TO_MOVE),
    );
  }

  destroy(): void {}

  tick(): LightsGroup {
    return this.lightsGroup;
  }
}
