import { BeatGenerator } from './beat-generator';
import { BeatEmitter, BeatEvent, GeneratorBeatEvent } from '../events';
import BeatPropagator from './beat-propagator';
import logger from '../../logger';

export interface BeatGeneratorResponse {
  id: string;
  name: string;
  /**
   * Whether this beat generator overrides the beats of all other generators.
   * This means that only these beats are acted upon by Aurora and propagated
   * to all clients that listen to them.
   */
  hasPrecedence: boolean;
}

/**
 * External interface class responsible for holding all beat generator instances and
 * transmitting the beats of the leading (highest-prio) generator.
 */
export default class BeatManager {
  private static instance: BeatManager;

  private beatEmitter: BeatEmitter;

  private readonly propagator: BeatPropagator;

  private generators: BeatGenerator[] = [];

  constructor() {
    this.propagator = new BeatPropagator(
      this.emitPrecedenceBeat.bind(this),
      this.emitBeat.bind(this),
    );
  }

  public static getInstance() {
    if (!BeatManager.instance) {
      BeatManager.instance = new BeatManager();
    }
    return BeatManager.instance;
  }

  public asResponse(generator: BeatGenerator): BeatGeneratorResponse {
    return {
      id: generator.getId(),
      name: generator.getName(),
      hasPrecedence: this.propagator.isHighestPriority(generator),
    };
  }

  /**
   * Register a new beat generator. Higher priority generators override the beats of
   * lower priority generators.
   * @param generator
   * @param priority
   */
  public add(generator: BeatGenerator, priority: number): void {
    generator.setPropagator(this.propagator);
    this.propagator.addPriority(generator, priority);
    this.generators.push(generator);
    generator.start();

    this.beatEmitter.emit('generator_add', this.asResponse(generator));
  }

  /**
   * Deregister and destroy a beat generator.
   * @param id
   */
  public remove(id: string): void {
    const index = this.generators.findIndex((g) => g.getId() === id);
    if (index >= 0) {
      this.propagator.removePriority(this.generators[index]);
      this.generators[index].destroy();
      this.beatEmitter.emit('generator_remove', this.asResponse(this.generators[index]));
      this.generators.splice(index, 1);
    }
  }

  /**
   * Get a beat detector from storage if it exists.
   * @param id
   */
  public get(id: string): BeatGenerator | undefined {
    return this.generators.find((g) => g.getId() === id);
  }

  /**
   * Get all beat detectors from storage.
   */
  public getAll(): BeatGenerator[] {
    return this.generators;
  }

  /**
   * Returns whether the manager has a beat generator with the given ID.
   * @param id
   */
  public has(id: string): boolean {
    return this.get(id) !== undefined;
  }

  public init(beatEmitter: BeatEmitter) {
    if (this.beatEmitter) {
      throw new Error('Beat Manager already initialized');
    }
    this.beatEmitter = beatEmitter;
  }

  public emitPrecedenceBeat(event: BeatEvent): void {
    if (this.beatEmitter) {
      this.beatEmitter.beatPrecedence(event);
    } else {
      logger.warn(
        'BeatManager tries to emit precedence beat, but class instance is not initialized!',
      );
    }
  }

  public emitBeat(event: GeneratorBeatEvent) {
    if (this.beatEmitter) {
      this.beatEmitter.beat(event);
    } else {
      logger.warn('BeatManager tries to emit beat, but class instance is not initialized!');
    }
  }
}
