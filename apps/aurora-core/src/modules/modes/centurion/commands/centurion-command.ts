import { CenturionContext, Lane } from '../centurion-context';

export abstract class CenturionCommand {
  constructor(public readonly startTime: number) {}
  abstract readonly lanes: Lane[];
  abstract execute(ctx: CenturionContext): void;
  restore(ctx: CenturionContext, lanes: ReadonlySet<Lane>): void {
    this.execute(ctx);
  }
}
