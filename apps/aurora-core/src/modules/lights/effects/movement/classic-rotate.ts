import {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProgressionProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { LightsGroup, LightsMovingHeadRgb, LightsMovingHeadWheel } from '../../entities';
import BaseRotate, { BaseRotateProps } from './base-rotate';
import { MovementEffects } from './movement-effetcs';
import { LightsEffectDirection, LightsEffectPattern } from '../lights-effect-pattern';

export interface ClassicRotateProps extends BaseRotateProps, BaseLightsEffectProgressionProps {}

export type ClassicRotateCreateParams = BaseLightsEffectCreateParams & {
  type: MovementEffects.ClassicRotate;
  props: ClassicRotateProps;
};

const DEFAULT_CYCLE_TIME = 10000;
const DEFAULT_OFFSET_FACTOR = 0;

export default class ClassicRotate extends BaseRotate<ClassicRotateProps> {
  /**
   * @param lightsGroup
   * @param props
   */
  constructor(lightsGroup: LightsGroup, props: ClassicRotateProps) {
    super(
      lightsGroup,
      {
        cycleTime: props.cycleTime || DEFAULT_CYCLE_TIME,
        offsetFactor: props.offsetFactor || DEFAULT_OFFSET_FACTOR,
      },
      { pattern: props.pattern, direction: props.direction },
    );
    this.props = props;
  }

  public static build(
    props: ClassicRotateProps = {},
  ): LightsEffectBuilder<ClassicRotateProps, ClassicRotate> {
    return (lightsGroup) => new ClassicRotate(lightsGroup, props);
  }

  /**
   * From https://en.wikipedia.org/wiki/Triangle_wave#Expressed_as_alternating_linear_functions
   * @param t
   * @private
   */
  private triangleFunction(t: number, p = 1) {
    const factor = Math.floor((2 * t) / p + 0.5);
    return (4 / p) * (t - (p / 2) * factor) * (-1) ** factor;
  }

  protected setPosition(
    movingHead: LightsMovingHeadWheel | LightsMovingHeadRgb,
    progression: number,
    offset: number = 0,
  ) {
    const pan = this.triangleFunction(progression + offset) / 2 + 0.5;
    const tilt = this.triangleFunction(progression * 4 + offset) / 2 + 0.5;
    movingHead.setPositionRel(pan, tilt);
  }
}
