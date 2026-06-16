import { BeatGenerator } from './beat-generator';
import { BeatEvent } from '../events/music-emitter-events';
import IBeatPropagator from './i-beat-propagator';
import logger from '../../logger';
import { GeneratorBeatEvent } from '../events';

export default class BeatPropagator implements IBeatPropagator {
  private priorities: Map<BeatGenerator, number> = new Map();

  private ping: boolean;

  constructor(
    private emitPrecedenceBeat: (event: BeatEvent) => void,
    private emitBeat: (event: GeneratorBeatEvent) => void,
  ) {}

  public addPriority(beatGenerator: BeatGenerator, priority: number): void {
    this.priorities.set(beatGenerator, priority);
  }

  public removePriority(beatGenerator: BeatGenerator): void {
    this.priorities.delete(beatGenerator);
  }

  private getHighestPriority(): number {
    return this.priorities
      .values()
      .reduce((minimum, v) => Math.max(minimum, v), Number.NEGATIVE_INFINITY);
  }

  public isHighestPriority(generator: BeatGenerator): boolean {
    const prio = this.priorities.get(generator);
    if (prio == undefined) {
      // Always reject beats from generators we don't know the priority of
      return false;
    }
    return prio === this.getHighestPriority();
  }

  public sendBeat(event: BeatEvent, generator: BeatGenerator): void {
    this.emitBeat({
      id: generator.getId(),
      name: generator.getName(),
      ...event,
    });

    if (!this.isHighestPriority(generator)) return;

    if (process.env.LOG_AUDIO_BEATS === 'true') {
      let beat = '';

      if (this.ping) beat += 'beat:   . ';
      if (!this.ping) beat += 'beat:  .  ';
      this.ping = !this.ping;

      beat += `: ${event.beat.start} (${generator.getName()})`;
      logger.info(beat);
    }

    this.emitPrecedenceBeat(event);
  }
}
