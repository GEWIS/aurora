import LightsEffect, {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProgressionProps,
  BaseLightsEffectProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { LightsGroup, LightsGroupMovingHeadRgbs, LightsGroupPars } from '../../entities';
import { ColorEffects } from './color-effects';
import { EffectProgressionTickStrategy } from '../progression-strategies';
import EffectProgressionMapFactory from '../progression-strategies/mappers/effect-progression-map-factory';
import { RgbColor } from '../../color-definitions';

export interface WaveProps extends BaseLightsEffectProps, BaseLightsEffectProgressionProps {
  /**
   * Number of waves, ignored if singleWave=true (1 by default)
   * @isInt
   * @minimum 1
   */
  nrWaves?: number;

  /**
   * How many ms each cycle of the wave takes (1000ms by default)
   * @isInt
   * @minimum 0
   */
  cycleTime?: number;

  /**
   * Whether the animation should only be executed once from start to finish
   * instead of a continuous animation (false by default)
   */
  singleWave?: boolean;
}

export type WaveCreateParams = BaseLightsEffectCreateParams & {
  type: ColorEffects.Wave;
  props: WaveProps;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_NR_WAVES = 1;
const DEFAULT_CYCLE_TIME = 2000;

export default class Wave extends LightsEffect<WaveProps> {
  constructor(lightsGroup: LightsGroup, props: WaveProps) {
    const cycleTime = props.cycleTime ?? DEFAULT_CYCLE_TIME;
    super(
      lightsGroup,
      new EffectProgressionTickStrategy(cycleTime, props.singleWave),
      new EffectProgressionMapFactory(lightsGroup).getMapper(props.pattern),
      props.direction,
    );
    this.props = props;
  }

  public static build(props: WaveProps): LightsEffectBuilder<WaveProps, Wave> {
    return (lightsGroup) => new Wave(lightsGroup, props);
  }

  setColors(colors: RgbColor[]) {
    this.props.colors = colors;
  }

  destroy(): void {
    this.lightsGroup.fixtures.forEach((f) => {
      f.fixture.resetColor();
    });
  }

  beat(): void {}

  /**
   * Get a fixture's brightness level
   * @private
   * @param relativeProgression
   */
  private getBrightness(relativeProgression: number) {
    // If we only show a single wave, we want it to be visible. So, by trial and error a size of
    // 1.5 fits best. This works, because the singleWave prop
    const nrWaves = this.props.singleWave ? 0.75 : (this.props.nrWaves ?? DEFAULT_NR_WAVES);

    // If we are outside the first half sine wave, we set some bounds.
    if (this.props.singleWave && relativeProgression < 0) return 0;
    if (this.props.singleWave && relativeProgression > 1) return 0;

    return Math.sin(relativeProgression * nrWaves * Math.PI * 2);
  }

  tick(): LightsGroup {
    super.tick();

    const currentTick = new Date();

    // Apply the wave effect to the fixture in a group
    const apply = (p: LightsGroupPars | LightsGroupMovingHeadRgbs) => {
      const progression = this.getProgression(currentTick, p);
      const brightness = this.getBrightness(progression);
      p.fixture.setBrightness(Math.max(0, brightness));
      p.fixture.setColor(this.props.colors[0]);
    };

    this.lightsGroup.pars.forEach(apply);
    this.lightsGroup.movingHeadRgbs.forEach(apply);

    return this.lightsGroup;
  }
}
