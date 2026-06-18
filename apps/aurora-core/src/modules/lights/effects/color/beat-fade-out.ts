import LightsEffect, {
  BaseLightsEffectCreateParams,
  BaseLightsEffectProgressionProps,
  BaseLightsEffectProps,
  LightsEffectBuilder,
} from '../lights-effect';
import { BeatEvent } from '../../../events/music-emitter-events';
import {
  LightsGroup,
  LightsGroupMovingHeadRgbs,
  LightsGroupMovingHeadWheels,
  LightsGroupPars,
} from '../../entities';
import { ColorEffects } from './color-effects';
import {
  EffectProgressionBeatStrategy,
  EffectProgressionTickStrategy,
} from '../progression-strategies';
import EffectProgressionStrategy from '../progression-strategies/effect-progression-strategy';
import LightsGroupFixture from '../../entities/lights-group-fixture';
import EffectProgressionMapFactory from '../progression-strategies/mappers/effect-progression-map-factory';
import { RgbColor } from '../../color-definitions';

export interface BeatFadeOutProps extends BaseLightsEffectProps, BaseLightsEffectProgressionProps {
  /**
   * Whether the lights should be turned off using a fade effect
   * on each beat
   */
  enableFade?: boolean;

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

export type BeatFadeOutCreateParams = BaseLightsEffectCreateParams & {
  type: ColorEffects.BeatFadeOut;
  props: BeatFadeOutProps;
};

export default class BeatFadeOut extends LightsEffect<BeatFadeOutProps> {
  private readonly nrSteps: number;

  private readonly nrPhases: number;

  private lastBeat = new Date().getTime(); // in ms since epoch;

  private beatLength: number = 1; // in ms;

  constructor(lightsGroup: LightsGroup, props: BeatFadeOutProps) {
    const nrSteps = props.colors.length + (props.nrBlacks ?? 0);

    const progressionMapperStrategy = new EffectProgressionMapFactory(lightsGroup).getMapper(
      props.pattern,
      nrSteps,
    );

    const nrPhases = Math.max(nrSteps, progressionMapperStrategy.getNrFixtures());

    let progressionStrategy: EffectProgressionStrategy;
    if (props.customCycleTime) {
      progressionStrategy = new EffectProgressionTickStrategy(props.customCycleTime);
    } else {
      progressionStrategy = new EffectProgressionBeatStrategy(nrPhases);
    }

    super(lightsGroup, progressionStrategy, progressionMapperStrategy, props.direction);

    this.nrSteps = nrSteps;
    this.nrPhases = nrPhases;
    this.props = props;

    if (this.props.customCycleTime) {
      this.beatLength = this.props.customCycleTime;
    }
  }

  /**
   * Create an constructor function that will create this effect with the given parameters
   * Used when you want to reference effects, but are not in the context of handlers.
   * on each beat
   * @param props
   */
  public static build(props: BeatFadeOutProps): LightsEffectBuilder<BeatFadeOutProps, BeatFadeOut> {
    return (lightsGroup: LightsGroup) => new BeatFadeOut(lightsGroup, props);
  }

  setColors(colors: RgbColor[]) {
    this.props.colors = colors;
  }

  destroy(): void {
    this.lightsGroup.fixtures.forEach((f) => {
      f.fixture.resetColor();
    });
  }

  beat(event: BeatEvent): void {
    super.beat(event);

    // If we use a custom cycle time, ignore all beats
    if (this.props.customCycleTime) return;

    this.lastBeat = new Date().getTime();
    this.beatLength = event.beat.duration * 1000;
  }

  tick(): LightsGroup {
    super.tick();

    const progressions: { id: number; value: string }[] = [];

    [
      ...this.lightsGroup.pars,
      ...this.lightsGroup.movingHeadRgbs,
      ...this.lightsGroup.movingHeadWheels,
    ]
      .sort((a, b) => a.positionX - b.positionX)
      .forEach((p, i) => {
        const { enableFade } = this.props;
        const beatProgression = enableFade
          ? Math.max(1 - (new Date().getTime() - this.lastBeat) / this.beatLength, 0)
          : 1;

        const { colors } = this.props;
        const progression = this.getProgression(new Date(), p);

        const phase = Math.round(progression * this.nrPhases);
        const index = phase % this.nrSteps;

        const color = colors[index];
        if (color == null) {
          p.fixture.resetColor();
        } else {
          p.fixture.setBrightness(beatProgression);
          p.fixture.setColor(color);
        }

        progressions.push({
          id: i,
          // value: `${progression.toFixed(3)} (${Math.round(phase).toString().padStart(2, '0')} -> ${index})`,
          value: index.toString(),
        });
      });

    const outputString = progressions.map((v) => `${v.id}: ${v.value}`).join(' | ');
    // console.log(outputString);

    return this.lightsGroup;
  }
}
