import { LightsEffectPattern } from '../../lights-effect-pattern';
import EffectProgressionMapHorizontalStrategy from './effect-progression-map-horizontal-strategy';
import { LightsGroup } from '../../../entities';
import EffectProgressionMapStrategy from './effect-progression-map-strategy';
import EffectProgressionMapVerticalStrategy from './effect-progression-map-vertical-strategy';
import EffectProgressionMapDiagonalBottomLeftTopRightStrategy from './effect-progression-map-diagonal-bottom-left-top-right-strategy';
import EffectProgressionMapDiagonalTopLeftBottomRightStrategy from './effect-progression-map-diagonal-top-left-bottom-right-strategy';
import EffectProgressionMapCenteredSquaredStrategy from './effect-progression-map-centered-squared-strategy';
import EffectProgressionMapCenteredCircularStrategy from './effect-progression-map-centered-circular-strategy';
import EffectProgressionMapRotationalStrategy from './effect-progression-map-rotational-strategy';

export default class EffectProgressionMapFactory {
  constructor(private lightsGroup: LightsGroup) {}

  public getMapper(
    pattern: LightsEffectPattern = LightsEffectPattern.HORIZONTAL,
    multiplier?: number,
  ): EffectProgressionMapStrategy {
    switch (pattern) {
      case LightsEffectPattern.HORIZONTAL:
        return new EffectProgressionMapHorizontalStrategy(this.lightsGroup, multiplier);
      case LightsEffectPattern.VERTICAL:
        return new EffectProgressionMapVerticalStrategy(this.lightsGroup, multiplier);
      case LightsEffectPattern.DIAGONAL_BOTTOM_LEFT_TO_TOP_RIGHT:
        return new EffectProgressionMapDiagonalBottomLeftTopRightStrategy(
          this.lightsGroup,
          multiplier,
        );
      case LightsEffectPattern.DIAGONAL_TOP_LEFT_TO_BOTTOM_RIGHT:
        return new EffectProgressionMapDiagonalTopLeftBottomRightStrategy(
          this.lightsGroup,
          multiplier,
        );
      case LightsEffectPattern.CENTERED_SQUARED:
        return new EffectProgressionMapCenteredSquaredStrategy(this.lightsGroup, multiplier);
      case LightsEffectPattern.CENTERED_CIRCULAR:
        return new EffectProgressionMapCenteredCircularStrategy(this.lightsGroup, multiplier);
      case LightsEffectPattern.ROTATIONAL:
        return new EffectProgressionMapRotationalStrategy(this.lightsGroup, multiplier);
    }
  }
}
