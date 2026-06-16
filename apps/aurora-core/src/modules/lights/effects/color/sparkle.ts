import LightsEffect, {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { LightsGroup } from '../../entities';
import { ColorEffects } from './color-effects';
import { RgbColor } from '../../color-definitions';

export interface SparkleProps extends BaseLightsEffectProps {
  /**
   * What percentage (on average) of the lights should be turned on
   * @minimum 0
   * @maximum 1
   */
  ratio?: number;

  /**
   * How many ms the light should take to slowly turn off
   * @isInt
   * @minimum 1
   */
  dimDuration?: number;

  /**
   * After how many ms (approximately) a ratio of lights should be turned on.
   * Defaults to 0, which enables the ratio of lights on the beat of the music.
   * @isInt
   * @minimum 0
   */
  cycleTime?: number;
}

export type SparkleCreateParams = BaseLightsEffectCreateParams & {
  type: ColorEffects.Sparkle;
  props: SparkleProps;
};

const DEFAULT_RATIO = 0.3;
const DEFAULT_DIM_DURATION = 800;
const DEFAULT_CYCLE_TIME = 0;

export default class Sparkle extends LightsEffect<SparkleProps> {
  private beats: Date[];

  private colorIndices: number[];

  private previousTick = new Date();

  /**
   * @param lightsGroup The group of lights this effect will be applied to
   * @param props
   */
  constructor(lightsGroup: LightsGroup, props: SparkleProps) {
    super(lightsGroup);

    const nrFixtures = lightsGroup.pars.length + lightsGroup.movingHeadRgbs.length;
    this.beats = new Array(nrFixtures).fill(new Date(0));
    this.colorIndices = new Array(nrFixtures).fill(0);

    this.props = props;
  }

  public static build(props: SparkleProps): LightsEffectBuilder<SparkleProps, Sparkle> {
    return (lightsGroup: LightsGroup) => new Sparkle(lightsGroup, props);
  }

  setColors(colors: RgbColor[]) {
    this.props.colors = colors;
  }

  /**
   * Enable a subset of lights, i.e. set their brightness back to 1
   * @private
   */
  private enableLights() {
    const ratio = this.props.ratio ?? DEFAULT_RATIO;

    // Create a random permutation of the lights
    const indices = this.beats.map((b, i) => i);
    const permutation = indices.sort((a, b) => Math.random() - 0.5);
    // Enable only the ratio of all lights
    const toEnable = permutation.slice(0, Math.round(ratio * this.beats.length));

    this.beats?.forEach((b, i) => {
      if (toEnable.includes(i)) {
        this.colorIndices[i] = (this.colorIndices[i] + 1) % Math.max(this.props.colors.length);
        this.beats[i] = new Date();
      }
    });
    this.previousTick = new Date();
  }

  destroy(): void {
    this.lightsGroup.fixtures.forEach((f) => {
      f.fixture.resetColor();
    });
  }

  beat(): void {
    if (!this.props.cycleTime) this.enableLights();
  }

  private getDimProgression(beat: Date) {
    const dimDuration = this.props.dimDuration ?? DEFAULT_DIM_DURATION;

    return Math.max(1 - (new Date().getTime() - beat.getTime()) / dimDuration, 0);
  }

  tick(): LightsGroup {
    const nrPars = this.lightsGroup.pars.length;
    const { colors, cycleTime: propsCycleTime, ratio: propsRatio } = this.props;
    const cycleTime = propsCycleTime ?? DEFAULT_CYCLE_TIME;

    // Turn on some lights according to the ratio if we have reached the time
    if (cycleTime > 0 && new Date().getTime() - this.previousTick.getTime() >= cycleTime) {
      this.enableLights();
    }

    this.lightsGroup.pars.forEach((p, i) => {
      const index = i;
      const progression = this.getDimProgression(this.beats[index]);
      const colorIndex = this.colorIndices[index];
      const color = colors[colorIndex % colors.length];
      p.fixture.setColor(color);
      p.fixture.setBrightness(progression);
    });
    this.lightsGroup.movingHeadRgbs.forEach((p, i) => {
      const index = i;
      const progression = this.getDimProgression(this.beats[nrPars + index]);
      const colorIndex = this.colorIndices[nrPars + index];
      const color = colors[colorIndex % colors.length];
      p.fixture.setColor(color);
      p.fixture.setBrightness(progression);
    });

    return this.lightsGroup;
  }
}
