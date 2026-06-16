import {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProgressionProps,
  BaseLightsEffectProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { LightsGroup, LightsMovingHeadRgb, LightsMovingHeadWheel } from '../../entities';
import BaseRotate, { BaseRotateProps } from './base-rotate';
import { MovementEffects } from './movement-effetcs';
import { LightsEffectDirection, LightsEffectPattern } from '../lights-effect-pattern';

export interface SearchLightProps extends BaseRotateProps, BaseLightsEffectProgressionProps {
  /**
   * Radius of the search light
   * @minimum 0
   * @maximum 2
   */
  radiusFactor?: number;
}

export type SearchLightCreateParams = BaseLightsEffectCreateParams & {
  type: MovementEffects.SearchLight;
  props: SearchLightProps;
};

const DEFAULT_RADIUS_FACTOR = 1;
const DEFAULT_CYCLE_TIME = 4000;
const DEFAULT_OFFSET_FACTOR = 0.25;

export default class SearchLight extends BaseRotate<SearchLightProps> {
  /**
   * @param lightsGroup
   * @param props
   */
  constructor(lightsGroup: LightsGroup, props: SearchLightProps) {
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
    props: SearchLightProps = {},
  ): LightsEffectBuilder<SearchLightProps, SearchLight> {
    return (lightsGroup) => new SearchLight(lightsGroup, props);
  }

  protected setPosition(
    movingHead: LightsMovingHeadWheel | LightsMovingHeadRgb,
    progression: number,
    offset: number = 0,
  ) {
    const radiusFactor = this.props.radiusFactor ?? DEFAULT_RADIUS_FACTOR;
    const pan = Math.cos(progression * 2 * Math.PI + offset) * 0.15 + 0.15;
    const tilt = Math.sin(progression * 2 * Math.PI + offset) * 0.25 * radiusFactor + 0.5;
    movingHead.setPositionRel(pan, tilt);
  }
}
