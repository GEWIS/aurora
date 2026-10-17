import { getTwoComplementaryRgbColors, RgbColor } from '../../lights/color-definitions';
import { LightsEffectBuilder } from '../../lights/effects/lights-effect';
import { BeatFadeOut, StaticColor } from '../../lights/effects/color';
import { ClassicRotate, SearchLight, TableRotate } from '../../lights/effects/movement';
import Wave from '../../lights/effects/color/wave';
import Sparkle from '../../lights/effects/color/sparkle';
import {
  getRandomLightsEffectDirection,
  getRandomLightsEffectPattern,
} from '../../lights/effects/lights-effect-pattern';
import type { CenturionContext, Lane } from './centurion-context';

export default class RandomEffectPicker {
  public roll(ctx: CenturionContext, lanes: ReadonlySet<Lane>) {
    ctx.state.screenColors = getTwoComplementaryRgbColors().colorNames;
    ctx.screenHandler.changeColors(ctx.state.screenColors);
    this.apply(ctx, ctx.state.screenColors, lanes);
  }

  public apply(ctx: CenturionContext, colors: RgbColor[], lanes: ReadonlySet<Lane>) {
    const bpm = ctx.beatController.songBpm;

    const newMovementEffectSideBuilder = this.getMovementEffectSide(bpm);
    const newMovementEffectCenterBuilder = this.getMovementEffectCenter(bpm);
    const movingHeadEffectColor = StaticColor.build({ color: RgbColor.WHITE });
    const newEffectBuilder = this.getParEffect(colors, bpm);

    ctx.lightsHandler.entities.forEach((l) => {
      const hasPars = l.pars.length > 0;
      const hasRgbs = l.movingHeadRgbs.length > 0;
      const hasWheels = l.movingHeadWheels.length > 0;
      const ownsMovement =
        (hasRgbs && lanes.has('rgbMovement')) || (hasWheels && lanes.has('wheelMovement'));

      // If we have a moving head, assign a movement effect
      if (ownsMovement && l.groupInMiddle) {
        ctx.lightsHandler.setMovementEffect(l, [newMovementEffectCenterBuilder]);
      } else if (ownsMovement) {
        ctx.lightsHandler.setMovementEffect(l, [newMovementEffectSideBuilder]);
      }
      // If we have a wheel moving head, assign a static color
      if (hasWheels) {
        if (lanes.has('wheelColor')) ctx.lightsHandler.setColorEffect(l, [movingHeadEffectColor]);
        // Otherwise use a random effect!
      } else if ((hasPars && lanes.has('parColor')) || (hasRgbs && lanes.has('rgbColor'))) {
        ctx.lightsHandler.setColorEffect(l, [newEffectBuilder]);
      }
    });
  }

  private getMovementEffectSide(bpm?: number): LightsEffectBuilder {
    if (!bpm) {
      return TableRotate.build();
    }

    // Baseline: cycle time of 10000ms for 120bpm
    const baseCycleTime = Math.round(1200000 / bpm);
    return TableRotate.build({ cycleTime: baseCycleTime });
  }

  private getMovementEffectCenter(bpm?: number): LightsEffectBuilder {
    // If we do not have a bpm, choose SearchLight as the default
    const defaultEffect = SearchLight.build({ radiusFactor: 1.5, cycleTime: 3000 });
    if (!bpm) {
      return defaultEffect;
    }

    const baseCycleTime = Math.round(360000 / bpm);
    const classicRotateProb = Math.max(0, Math.min(1, (bpm - 120) / 60));

    const effects = [
      {
        effect: ClassicRotate.build({ cycleTime: baseCycleTime * 4 }),
        probability: classicRotateProb,
      },
      {
        effect: SearchLight.build({ radiusFactor: 1.5, cycleTime: baseCycleTime }),
        probability: 1 - classicRotateProb,
      },
    ];
    let factor = Math.random();

    return (
      effects.find((effect, i) => {
        const previous = effects.slice(0, i).reduce((x, e) => x + e.probability, 0);
        return previous <= factor && previous + effect.probability > factor;
      })?.effect || defaultEffect
    );
  }

  private getParEffect(colors: RgbColor[], bpm?: number): LightsEffectBuilder {
    const pattern = getRandomLightsEffectPattern();
    const direction = getRandomLightsEffectDirection();

    const effects = [
      {
        effect: BeatFadeOut.build({
          colors,
          enableFade: false,
          nrBlacks: 1,
          pattern,
          direction,
        }),
        probability: 0.8,
      },
      {
        effect: Sparkle.build({ colors }),
        probability: 0.1,
      },
      {
        effect: Wave.build({
          colors: colors,
          pattern,
          direction,
        }),
        probability: 0.1,
      },
    ];
    let factor = Math.random();

    if (!bpm || bpm < 120) {
      // If the music is relatively slow or really fast, do not use wave or sparkle
      factor = factor - 0.2;
    } else if (bpm > 160) {
      // If the music is really fast, do not use wave, as the other effects will be
      // much more energetic
      factor = factor - 0.1;
    }

    console.log(factor);

    return (
      effects.find((effect, i) => {
        const previous = effects.slice(0, i).reduce((x, e) => x + e.probability, 0);
        return previous <= factor && previous + effect.probability > factor;
      })?.effect || effects[0].effect
    );
  }
}
