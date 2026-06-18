import LightsEffect, {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { ColorEffects } from './color-effects';
import { LightsGroup } from '../../entities';
import { RgbColor } from '../../color-definitions';
import { BeatEvent } from '../../../events/music-emitter-events';

export interface RandomColorProps extends BaseLightsEffectProps {
  /**
   * How many "black" fixtures should be added. Zero for no blacks
   * @isInt
   * @minimum 0
   */
  nrBlacks?: number;

  /**
   * Amount of time it takes before the lights switch to the next state (in ms). If undefined,
   * beats will be used for switching states
   * @isInt
   * @minimum 0
   */
  customCycleTime?: number;
}

export type RandomColorCreateParams = BaseLightsEffectCreateParams & {
  type: ColorEffects.RandomColor;
  props: RandomColorProps;
};

export default class RandomColor extends LightsEffect<RandomColorProps> {
  private readonly nrSteps: number;

  private colorIndices: number[];

  private startTick = new Date();

  constructor(lightsGroup: LightsGroup, props: RandomColorProps) {
    super(lightsGroup);

    this.nrSteps = props.colors.length + (props.nrBlacks || 0);
    this.props = props;

    const nrFixtures = lightsGroup.pars.length + lightsGroup.movingHeadRgbs.length;
    this.colorIndices = new Array(nrFixtures).fill(0);
    this.assignNewColorPermutation();
  }

  public static build(props: RandomColorProps): LightsEffectBuilder<RandomColorProps, RandomColor> {
    return (lightsGroup: LightsGroup) => new RandomColor(lightsGroup, props);
  }

  /**
   * Give each fixture a random color based on a permutation
   * @private
   */
  private assignNewColorPermutation() {
    const indices = this.colorIndices.map((_, i) => i);
    const fixturesPerColor = indices.length / this.nrSteps;

    const permutation = indices.sort(() => Math.random() - 0.5);
    permutation.forEach((i1, i2) => {
      this.colorIndices[i1] = Math.floor(i2 / fixturesPerColor);
    });
  }

  setColors(colors: RgbColor[]) {
    this.props.colors = colors;
  }

  destroy() {
    this.lightsGroup.fixtures.forEach((f) => {
      f.fixture.resetColor();
    });
  }

  beat(event: BeatEvent) {
    super.beat(event);

    if (this.props.customCycleTime) return;

    this.assignNewColorPermutation();
  }

  tick(): LightsGroup {
    super.tick();

    if (
      this.props.customCycleTime &&
      new Date().getTime() - this.startTick.getTime() > this.props.customCycleTime
    ) {
      this.startTick = new Date();
      this.assignNewColorPermutation();
    }

    [...this.lightsGroup.pars, ...this.lightsGroup.movingHeadRgbs].forEach((f, i) => {
      const color = this.props.colors[this.colorIndices[i]];
      f.fixture.setColor(color);
    });

    return this.lightsGroup;
  }
}
