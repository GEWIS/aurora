import LightsEffect, { BaseLightsEffectCreateParams, LightsEffectBuilder } from '../lights-effect';
import { LightsGroup } from '../../entities';
import { RgbColor } from '../../color-definitions';
import { ColorEffects } from './color-effects';

export interface StaticColorProps {
  /**
   * Color that should be shown
   */
  color: RgbColor;

  /**
   * Name of the gobo that should be used (nothing by default)
   */
  gobo?: string;

  /**
   * Name of the gobo rotate that should be used (nothing by default)
   */
  goboRotate?: string;

  /**
   * Whether to toggle each fixture on/off on the beat of the music (false by default)
   */
  beatToggle?: boolean;

  /**
   * Brightness (1 by default)
   * @isInt
   * @minimum 0
   * @maximum 1
   */
  relativeBrightness?: number;

  /**
   * In how many ms the fixture should light up to the relativeBrightness on effect start.
   * Disabled if undefined
   */
  brightenTimeMs?: number;

  /**
   * In how many ms the fixture should dim from the relativeBrightness on effect start.
   * Disabled if undefined or if brightenTimeMs is not undefined
   */
  dimTimeMs?: number;
}

export type StaticColorCreateParams = BaseLightsEffectCreateParams & {
  type: ColorEffects.StaticColor;
  props: StaticColorProps;
};

export default class StaticColor extends LightsEffect<StaticColorProps> {
  private ping = 0;

  private cycleStartTick: Date = new Date();

  constructor(lightsGroup: LightsGroup, props: StaticColorProps) {
    super(lightsGroup);
    this.props = props;

    this.lightsGroup.fixtures.forEach((f) => {
      f.fixture.setColor(this.props.color);
      if (!this.props.beatToggle) {
        f.fixture.setBrightness(this.props.relativeBrightness ?? 1);
      }
    });
    this.lightsGroup.movingHeadWheels.forEach((f) => {
      f.fixture.setGobo(this.props.gobo);
      f.fixture.setGoboRotate(this.props.goboRotate);
    });

    this.beat();
  }

  public static build(props: StaticColorProps): LightsEffectBuilder<StaticColorProps, StaticColor> {
    return (lightsGroup) => new StaticColor(lightsGroup, props);
  }

  setColors(colors: RgbColor[]) {
    this.props.color = colors[0];
  }

  beat(): void {
    if (!this.props.beatToggle) return;

    this.ping = (this.ping + 1) % 2;
  }

  destroy(): void {
    this.lightsGroup.fixtures.forEach((f) => {
      f.fixture.resetColor();
    });
  }

  private getDimProgression(durationMs: number) {
    return Math.min(1, (new Date().getTime() - this.cycleStartTick.getTime()) / durationMs);
  }

  tick(): LightsGroup {
    let progression = 1;
    if (this.props.brightenTimeMs) progression = this.getDimProgression(this.props.brightenTimeMs);
    if (this.props.dimTimeMs) progression = 1 - this.getDimProgression(this.props.dimTimeMs);

    this.lightsGroup.fixtures
      .sort((f1, f2) => f1.firstChannel - f2.firstChannel)
      .forEach((f, i) => {
        // If beatToggle is disabled, or if it is enabled and the fixture should be turned on
        if (!this.props.beatToggle || i % 2 === this.ping) {
          f.fixture.setBrightness(progression * (this.props.relativeBrightness ?? 1));
        } else {
          f.fixture.setBrightness(0);
        }
      });

    return this.lightsGroup;
  }
}
