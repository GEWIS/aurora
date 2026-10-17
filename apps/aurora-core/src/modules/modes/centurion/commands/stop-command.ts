import { CenturionCommand } from './centurion-command';
import { CenturionContext, Lane } from '../centurion-context';

export default class StopCommand extends CenturionCommand {
  readonly lanes: Lane[] = [];

  execute(ctx: CenturionContext) {
    ctx.stop();
  }
}
