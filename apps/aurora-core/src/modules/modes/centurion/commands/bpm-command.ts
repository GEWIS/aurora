import { Lane, CenturionContext } from '../centurion-context';
import { CenturionCommand } from './centurion-command';
import { Bpm } from '../../../lights/mix-tape';

export default class BpmCommand extends CenturionCommand {
  readonly lanes: Lane[] = ['bpm'];

  constructor(private readonly event: Bpm & { timestamp: number }) {
    super(event.timestamp);
  }

  execute(ctx: CenturionContext): void {
    ctx.beatController.setSong(this.event.data.bpm);
  }
}
