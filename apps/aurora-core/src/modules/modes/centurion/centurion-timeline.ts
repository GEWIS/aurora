import { CenturionCommand } from './commands/centurion-command';
import { Lane } from './centurion-context';
import { MixTape } from './tapes';
import { toCommand } from './commands';
import StopCommand from './commands/stop-command';

export default class CenturionTimeline {
  private readonly n_lanes: number;

  /**
   * Construct a new timeline object, assumes the commands array is sorted.
   * @param commands
   */
  constructor(public readonly commands: CenturionCommand[]) {
    this.n_lanes = new Set(commands.flatMap((c) => c.lanes)).size;
  }

  /**
   * Returns for each lane the last command that used it before or on the timestamp.
   * @param timestamp
   */
  public ownersAt(timestamp: number): Map<Lane, CenturionCommand> {
    const owners = new Map<Lane, CenturionCommand>();
    for (let i = this.indexAfter(timestamp) - 1; i >= 0 && owners.size < this.n_lanes; i--) {
      const cmd = this.commands[i];
      cmd.lanes.forEach((l) => {
        if (!owners.has(l)) owners.set(l, cmd);
      });
    }
    return owners;
  }

  /**
   * Finds the index of the next command after timestamp t using binary search.
   * @param t
   */
  public indexAfter(t: number): number {
    let low = 0;
    let high = this.commands.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (this.commands[middle].startTime <= t) low = middle + 1;
      else high = middle;
    }
    return low;
  }

  public static fromMixTape(tape: MixTape, hasDiscoball: boolean): CenturionTimeline {
    return new CenturionTimeline([
      ...tape.feed.map((e) => toCommand(e, hasDiscoball)),
      new StopCommand(tape.duration),
    ]);
  }
}
