import { v4 as uuidv4 } from 'uuid';
import SubscribeEntity from '../root/entities/subscribe-entity';
import { BeatEvent } from '../events/music-emitter-events';
import logger from '../../logger';

export default abstract class BaseHandler<T extends SubscribeEntity> {
  /**
   * Used to distinguish multiple instances of the same handler type
   */
  public identifier: string;

  private _entities: T[];

  public constructor() {
    this.identifier = uuidv4();
    this._entities = [];
  }

  private async setHandlerRef(entity: T) {
    // eslint-disable-next-line no-param-reassign
    entity.currentHandler = this.constructor.name;
    await entity.save();
  }

  /**
   * Add a lights controller to this handler
   * @param entity
   */
  public registerEntity(entity: T): void {
    this._entities.push(entity);
    this.setHandlerRef(entity).catch((e) => logger.error(e));
  }

  /**
   * Unregister a controller from this handler
   * @param entityCopy
   */
  public removeEntity(entityCopy: T): void {
    this._entities = this._entities.filter((e) => e.id !== entityCopy.id);
  }

  /**
   * Return whether this handler has this entity
   * @param entity
   */
  public hasEntity(entity: T): boolean {
    return this._entities.findIndex((e) => e.id === entity.id) >= 0;
  }

  /**
   * Get the entities being registered to this handler
   */
  public get entities() {
    return this._entities;
  }

  /**
   * Beat of the currently playing song
   * @param event Metadata about the beat and the currently playing song.
   * Only includes information about the future
   */
  abstract beat(event: BeatEvent): void;

  /**
   * Reset the handler to its initial state
   */
  public reset(): void {
    // No implementation by default, each handler should override this method
    // if it's applicable.
  }
}
