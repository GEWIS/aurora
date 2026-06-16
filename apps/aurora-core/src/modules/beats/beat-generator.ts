import { BeatEvent } from '../events';
import IBeatPropagator from './i-beat-propagator';

export abstract class BeatGenerator {
  private propagator: IBeatPropagator | undefined;

  protected constructor(
    private id: string,
    private name: string,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  protected sendBeat(event: BeatEvent): void {
    if (!this.propagator) {
      throw new Error(
        'BeatGenerator instance does not have a propagator. Set one first before sending the first beat.',
      );
    }
    this.propagator.sendBeat(event, this);
  }

  public setPropagator(propagator: IBeatPropagator): void {
    this.propagator = propagator;
  }

  /**
   * Start the beat generator. This cannot be done in the constructor, as the BeatManager
   * adds a propagator to this instance, which is required to emit beats.
   */
  abstract start(): void;
  abstract destroy(): void;
}
