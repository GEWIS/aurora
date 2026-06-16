import LightsEffect, { BaseLightsEffectCreateParams, LightsEffectBuilder } from '../lights-effect';
import { LightsGroup } from '../../entities';
import { MovementEffects } from './movement-effetcs';

export type FixedPositionPropsAbs = {
  variant: 'Absolute';

  /**
   * Absolute pan value of the moving heads. Any decimals are applied to the finePan if it exists.
   * @minimum 0
   * @maximum 256
   */
  pan: number;

  /**
   * Relative tilt value of the moving heads. Any decimals are applied to the fineTilt if it exists.
   * @minimum 0
   * @maximum 256
   */
  tilt: number;
};

export type FixedPositionPropsRel = {
  variant: 'Relative';

  /**
   * Relative pan value of the moving heads. Any decimals are applied to the finePan if it exists.
   * @minimum 0
   * @maximum 1
   */
  pan: number;

  /**
   * Relative tilt value of the moving heads. Any decimals are applied to the fineTilt if it exists.
   * @minimum 0
   * @maximum 1
   */
  tilt: number;
};

export type FixedPositionProps = FixedPositionPropsAbs | FixedPositionPropsRel;

export type FixedPositionCreateParams = BaseLightsEffectCreateParams & {
  type: MovementEffects.FixedPosition;
  props: FixedPositionProps;
};

export default class FixedPosition extends LightsEffect<FixedPositionProps> {
  constructor(lightsGroup: LightsGroup, props: FixedPositionProps) {
    super(lightsGroup);
    this.props = props;

    if (props.variant === 'Absolute') {
      lightsGroup.movingHeadRgbs.forEach(({ fixture }) => {
        fixture.setPosition(props.pan, props.tilt);
      });
      lightsGroup.movingHeadWheels.forEach(({ fixture }) => {
        fixture.setPosition(props.pan, props.tilt);
      });
    } else if (props.variant === 'Relative') {
      lightsGroup.movingHeadRgbs.forEach(({ fixture }) => {
        fixture.setPositionRel(props.pan, props.tilt);
      });
      lightsGroup.movingHeadWheels.forEach(({ fixture }) => {
        fixture.setPositionRel(props.pan, props.tilt);
      });
    }
  }

  public static build(
    props: FixedPositionProps,
  ): LightsEffectBuilder<FixedPositionProps, FixedPosition> {
    return (lightsGroup) => new FixedPosition(lightsGroup, props);
  }

  beat(): void {}

  destroy(): void {
    [...this.lightsGroup.movingHeadRgbs, ...this.lightsGroup.movingHeadWheels].forEach((f) => {
      f.fixture.movement.reset();
    });
  }

  tick(): LightsGroup {
    return this.lightsGroup;
  }
}
