import { CenturionContext, Lane } from '../centurion-context';
import { CenturionCommand } from './centurion-command';
import { Effect } from '../../../lights/mix-tape';

// Converts the names in the tape to the names used by the command system.
const SLOT_LANES = [
  ['pars', 'parColor'],
  ['movingHeadRgbColor', 'rgbColor'],
  ['movingHeadRgbMovement', 'rgbMovement'],
  ['movingHeadWheelColor', 'wheelColor'],
  ['movingHeadWheelMovement', 'wheelMovement'],
] as const;

export default class EffectCommand extends CenturionCommand {
  readonly lanes: Lane[];

  private readonly random: boolean;

  constructor(
    private readonly event: Effect & { timestamp: number },
    hasDiscoball: boolean,
  ) {
    super(event.timestamp);
    const { data } = event;

    const onlyDiscoball = SLOT_LANES.every(([slot]) => data.effects[slot]?.length === 0);
    this.random =
      !data.reset && (!!data.random || (!!data.discoBall && onlyDiscoball && !hasDiscoball));

    this.lanes =
      data.reset || this.random
        ? SLOT_LANES.map(([, lane]) => lane)
        : SLOT_LANES.filter(([slot]) => data.effects[slot]).map(([, lane]) => lane);
    if (this.random) this.lanes.push('screenColors');
    // A random effect keeps the disco ball as it is, unless it sets discoBall itself
    if (!this.random || data.discoBall !== undefined) this.lanes.push('discoBall');
  }

  execute(ctx: CenturionContext): void {
    this.restore(ctx, new Set(this.lanes));
  }

  restore(ctx: CenturionContext, lanes: ReadonlySet<Lane>): void {
    const { data } = this.event;

    if (lanes.has('discoBall')) {
      if (data.discoBall) ctx.discoBall.enable();
      else ctx.discoBall.disable();
    }

    if (this.random) {
      if (lanes.has('screenColors')) {
        ctx.randomEffects.roll(ctx, lanes);
        // Restart the beat generators so no beat lands right after the lights change
        ctx.beatController.restart();
      }
      return;
    }

    const { effects } = data;
    ctx.lightsHandler.entities.forEach((l) => {
      const hasRgbs = l.movingHeadRgbs.length > 0;
      const hasWheels = l.movingHeadWheels.length > 0;

      if (data.reset) {
        const ownsGroup =
          (l.pars.length > 0 && lanes.has('parColor')) ||
          (hasRgbs && (lanes.has('rgbColor') || lanes.has('rgbMovement'))) ||
          (hasWheels && (lanes.has('wheelColor') || lanes.has('wheelMovement')));
        if (ownsGroup) {
          ctx.lightsHandler.removeColorEffect(l);
          ctx.lightsHandler.removeMovementEffect(l);
        }
        return;
      }

      if (l.pars.length > 0 && lanes.has('parColor') && effects.pars) {
        ctx.lightsHandler.setColorEffect(l, effects.pars);
      }
      if (hasRgbs) {
        if (lanes.has('rgbColor') && effects.movingHeadRgbColor)
          ctx.lightsHandler.setColorEffect(l, effects.movingHeadRgbColor);
        if (lanes.has('rgbMovement') && effects.movingHeadRgbMovement)
          ctx.lightsHandler.setMovementEffect(l, effects.movingHeadRgbMovement);
      }
      if (hasWheels) {
        if (lanes.has('wheelColor') && effects.movingHeadWheelColor)
          ctx.lightsHandler.setColorEffect(l, effects.movingHeadWheelColor);
        if (lanes.has('wheelMovement') && effects.movingHeadWheelMovement)
          ctx.lightsHandler.setMovementEffect(l, effects.movingHeadWheelMovement);
      }
    });
  }
}
