import { CenturionCommand } from './centurion-command';
import { CenturionContext, Lane } from '../centurion-context';
import { Horn } from '../../../lights/mix-tape';

const STROBE_TIME = 1500; // Milliseconds

export default class HornCommand extends CenturionCommand {
  readonly lanes: Lane[] = ['horn'];

  constructor(private readonly event: Horn & { timestamp: number }) {
    super(event.timestamp);
  }

  execute(ctx: CenturionContext): void {
    const strobeTime = this.event.data.strobeTime ?? STROBE_TIME;

    ctx.state.lastHornEvent = this.event;
    ctx.lightsHandler.entities.forEach((l) => {
      l.pars.forEach((p) => p.fixture.enableStrobe(strobeTime));
      l.movingHeadRgbs.forEach((p) => p.fixture.enableStrobe(strobeTime));
      l.movingHeadWheels.forEach((p) => p.fixture.enableStrobe(strobeTime));
    });
    ctx.screenHandler.horn(strobeTime, this.event.data.counter);
  }

  restore(ctx: CenturionContext): void {
    ctx.state.lastHornEvent = this.event;
    ctx.screenHandler.hornCount(this.event.data.counter);
  }
}
