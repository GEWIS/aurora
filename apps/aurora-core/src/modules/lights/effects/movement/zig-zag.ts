import BaseRotate, { BaseRotateProps } from './base-rotate';
import {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProgressionProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { MovementEffects } from './movement-effetcs';
import { LightsGroup, LightsMovingHeadRgb, LightsMovingHeadWheel } from '../../entities';

export interface ZigZagProps extends BaseRotateProps, BaseLightsEffectProgressionProps {
  /**
   * How much the moving head should pan to the left and right
   */
  horizontalRadius?: number;

  /**
   * How much the moving head should tilt up and down
   */
  verticalRadius?: number;
}

export type ZigZagCreateParams = BaseLightsEffectCreateParams & {
  type: MovementEffects.ZigZag;
  props: ZigZagProps;
};

const DEFAULT_HOZ_RADIUS_FACTOR = 0.5;
const DEFAULT_VERT_RADIUS_FACTOR = 0.8;
const DEFAULT_CYCLE_TIME = 20000;
const DEFAULT_OFFSET_FACTOR = 0.25;

export default class ZigZag extends BaseRotate<ZigZagProps> {
  constructor(lightsGroup: LightsGroup, props: ZigZagProps) {
    super(
      lightsGroup,
      {
        cycleTime: props.cycleTime || DEFAULT_CYCLE_TIME,
        offsetFactor: props.offsetFactor || DEFAULT_OFFSET_FACTOR,
      },
      {
        pattern: props.pattern,
        direction: props.direction,
      },
    );

    this.props = props;
  }

  public static build(props: ZigZagProps = {}): LightsEffectBuilder<ZigZagProps, ZigZag> {
    return (lightsGroup: LightsGroup) => new ZigZag(lightsGroup, props);
  }

  protected setPosition(
    movingHead: LightsMovingHeadWheel | LightsMovingHeadRgb,
    progression: number,
    offset: number,
  ) {
    const hozRadiusFactor = this.props.horizontalRadius || DEFAULT_HOZ_RADIUS_FACTOR;
    const horizontalRadius = hozRadiusFactor / 4;
    const vertRadiusFactor = this.props.verticalRadius || DEFAULT_VERT_RADIUS_FACTOR;
    const verticalRadius = vertRadiusFactor / 2;

    const panChannel = Math.sin(progression * 2 * Math.PI + offset) * horizontalRadius + 0.5;
    const tiltChannel = Math.sin(progression * 24 * Math.PI + offset) * verticalRadius + 0.5;
    movingHead.setPositionRel(panChannel, tiltChannel);
  }
}
