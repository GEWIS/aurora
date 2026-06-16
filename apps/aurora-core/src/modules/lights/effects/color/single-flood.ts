import LightsEffect, { BaseLightsEffectCreateParams, LightsEffectBuilder } from '../lights-effect';
import { LightsGroup } from '../../entities';
import { RgbColor } from '../../color-definitions';
import { ColorEffects } from './color-effects';

const TURN_ON_TIME = 75;
const KEEP_ON_TIME = 100;
const DEFAULT_DIM_MILLISECONDS = 500;

export interface SingleFloodProps {
  /**
   * The flood color, warm white/orange/yellow by default
   */
  color?: RgbColor;

  /**
   * In how many milliseconds the lights should turn off with a dim effect
   * @isInt
   * @minimum 0
   */
  dimMilliseconds?: number;
}

export type SingleFloodCreateParams = BaseLightsEffectCreateParams & {
  type: ColorEffects.SingleFlood;
  props: SingleFloodProps;
};

export default class SingleFlood extends LightsEffect<SingleFloodProps> {
  private effectStartTime = new Date();

  constructor(lightsGroup: LightsGroup, props: SingleFloodProps) {
    super(lightsGroup);
    this.props = props;
  }

  destroy(): void {
    this.lightsGroup.fixtures.forEach((f) => {
      f.fixture.resetColor();
    });
  }

  beat(): void {}

  public static build(
    props: SingleFloodProps = {},
  ): LightsEffectBuilder<SingleFloodProps, SingleFlood> {
    return (lightsGroup) => new SingleFlood(lightsGroup, props);
  }

  protected getProgression(currentTick: Date) {
    const dimMilliseconds = this.props.dimMilliseconds ?? DEFAULT_DIM_MILLISECONDS;
    const diff = Math.max(0, currentTick.getTime() - this.effectStartTime.getTime());
    if (diff < TURN_ON_TIME) return diff / TURN_ON_TIME;
    if (diff < TURN_ON_TIME + KEEP_ON_TIME) return 1;
    return 1 - Math.min(1, (diff - TURN_ON_TIME - KEEP_ON_TIME) / dimMilliseconds);
  }

  tick(): LightsGroup {
    const progression = this.getProgression(new Date());

    this.lightsGroup.pars.forEach((p) => {
      p.fixture.setColor(this.props.color ?? RgbColor.ORANGE);
      p.fixture.setBrightness(progression);
    });

    this.lightsGroup.movingHeadWheels.forEach((m) => m.fixture.blackout());
    this.lightsGroup.movingHeadRgbs.forEach((m) => m.fixture.blackout());

    return this.lightsGroup;
  }
}
