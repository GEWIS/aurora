import {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProgressionProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { LightsGroup, LightsMovingHeadRgb, LightsMovingHeadWheel } from '../../entities';
import BaseRotate, { BaseRotateProps } from './base-rotate';
import { MovementEffects } from './movement-effetcs';

export interface TableRotateProps extends BaseRotateProps, BaseLightsEffectProgressionProps {}

export type TableRotateCreateParams = BaseLightsEffectCreateParams & {
  type: MovementEffects.TableRotate;
  props: TableRotateProps;
};

const DEFAULT_CYCLE_TIME = 8000;
const DEFAULT_OFFSET_FACTOR = 0.25;

export default class TableRotate extends BaseRotate<TableRotateProps> {
  /**
   * @param lightsGroup
   * @param props
   */
  constructor(lightsGroup: LightsGroup, props: TableRotateProps) {
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
    props: TableRotateProps = {},
  ): LightsEffectBuilder<TableRotateProps, TableRotate> {
    return (lightsGroup) => new TableRotate(lightsGroup, props);
  }

  protected setPosition(
    movingHead: LightsMovingHeadWheel | LightsMovingHeadRgb,
    progression: number,
    offset: number = 0,
  ) {
    const panChannel = Math.cos(progression * 2 * Math.PI + offset) / 4 + 0.25;
    const tiltChannel = Math.sin(progression * 6 * Math.PI + offset) * 0.25 + 0.4;

    movingHead.setPositionRel(panChannel, tiltChannel);
  }
}
