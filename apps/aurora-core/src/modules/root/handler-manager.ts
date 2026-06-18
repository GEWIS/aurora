import { Server } from 'socket.io';
import BaseAudioHandler from '../handlers/base-audio-handler';
import BaseLightsHandler from '../handlers/base-lights-handler';
import BaseScreenHandler from '../handlers/base-screen-handler';
import SubscribeEntity from './entities/subscribe-entity';
import BaseHandler from '../handlers/base-handler';
import SimpleAudioHandler from '../handlers/audio/simple-audio-handler';
import dataSource from '../../database';
import { Audio, Screen } from './entities';
import { LightsGroup } from '../lights/entities';
import { RandomEffectsHandler } from '../handlers/lights';
import SetEffectsHandler from '../handlers/lights/set-effects-handler';
import DevelopEffectsHandler from '../handlers/lights/develop-effects-handler';
import { BeatEvent, TrackChangeEvent } from '../events/music-emitter-events';
import { CurrentlyPlayingTrackHandler, CenturionScreenHandler } from '../handlers/screen';
// eslint-disable-next-line import/no-cycle -- TODO fix cyclic dependency
import { ScenesHandler } from '../handlers/lights/scenes-handler';
import EffectSequenceHandler from '../handlers/lights/effect-sequence-handler';
import { MusicEmitter } from '../events';
import StageEffectsHandler from '../handlers/screen/stage-effects-handler';
import { SocketioNamespaces } from '../../socketio-namespaces';
import logger from '../../logger';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';
import TimeTrailRaceScreenHandler from '../handlers/screen/time-trail-race-screen-handler';
import TimeTrailRaceLightsHandler from '../handlers/lights/time-trail-race-lights-handler';
import HandlerFactory from './handler-factory';
import { ShowOrdersEvent } from '../events/order-emitter-events';
import EmitterStore from '../events/emitter-store';

/**
 * Main broker for managing handlers. This object registers entities to their
 * corresponding handlers and transmits events towards all known handlers.
 * Primarily used by HTTP controllers to attach entities to handlers.
 * Therefore, required to be a singleton class, because TSOA controllers are
 * otherwise unable to get an instance of this object.
 */
export default class HandlerManager {
  private static instance: HandlerManager;

  private initialized: boolean = false;

  private _handlers: Map<typeof SubscribeEntity, BaseHandler<SubscribeEntity>[]> = new Map();

  protected restoreHandlers<T extends SubscribeEntity, U extends BaseHandler<T>>(
    entity: T,
    handlers: U[],
  ) {
    handlers.forEach((handler) => {
      if (handler.constructor.name === entity.currentHandler) {
        handler.registerEntity(entity);
      }
    });
  }

  /**
   * Initialize the HandlerManager object if it is not already initialized.
   * It fetches all relevant entities (audios, lightGroups, screens) from the database
   * and registers them to their handlers
   * @private
   */
  public async init() {
    if (this.initialized) throw new Error('HandlerManager already initialized.');
    await Promise.all(
      Array.from(this._handlers.keys()).map(async (entity) => {
        const entities = await dataSource.manager.find(entity);
        entities.forEach((instance) => {
          const handlers = this._handlers.get(instance.constructor as typeof SubscribeEntity);
          if (handlers === undefined)
            throw new Error(`Unknown entity: ${instance.constructor.name}`);
          this.restoreHandlers(instance, handlers);
        });
      }),
    );
  }

  /**
   * Register all possible handlers in this function
   */
  private constructor(
    private io: Server,
    private emitterStore: EmitterStore,
  ) {
    this.emitterStore.musicEmitter.on('beat', this.beat.bind(this));
    this.emitterStore.musicEmitter.on('change_track', this.changeTrack.bind(this));
    this.emitterStore.orderEmitter.on('orders', this.showOrders.bind(this));

    const factory = new HandlerFactory(this.io, this.emitterStore.musicEmitter);

    // Register all handlers
    this._handlers.set(Audio, factory.createAudioHandlers());
    this._handlers.set(LightsGroup, factory.createLightHandlers());
    this._handlers.set(Screen, factory.createScreenHandlers());
  }

  /**
   * Get the current instance. Parameters are only necessary if it is
   * the first time an instance is requested and a new object should be created
   * @param io
   * @param emitterStore
   */
  public static getInstance(io?: Server, emitterStore?: EmitterStore) {
    if (this.instance == null && (io === undefined || emitterStore === undefined)) {
      throw new Error('Not all parameters provided to initialize');
    } else if (this.instance == null) {
      this.instance = new HandlerManager(io!, emitterStore!);
    }
    return this.instance;
  }

  /**
   * Get all handlers that belong to the given entity type (audio, lightsGroup, screen)
   * @param entity
   */
  public getHandlers(entity?: typeof SubscribeEntity): BaseHandler<SubscribeEntity>[] {
    if (!entity) return Array.from(this._handlers.values()).flat();
    return this._handlers.get(entity) || [];
  }

  /**
   * Get the handler this entity is assigned to. Undefined if not assigned to any handler.
   * @param entity
   */
  public getHandler<T extends SubscribeEntity>(entity: T): string | undefined {
    const handlers = this.getHandlers(entity.constructor as typeof SubscribeEntity);
    const match = handlers.find((h) => h.hasEntity(entity));
    if (!match) return undefined;
    return match.constructor.name;
  }

  /**
   * Register the given entity with a new handler. Before doing so, deregister with the old handler
   * If newHandler equals '' (empty string), do not register with any handler.
   * @param entity
   * @param newHandler
   */
  public registerHandler<T extends SubscribeEntity>(entity: T, newHandler: string | ''): boolean {
    const handlers = this.getHandlers(entity.constructor as typeof SubscribeEntity);
    handlers.forEach((handler) => {
      handler.removeEntity(entity);
    });

    const socketId = entity.socketIds ? (entity.socketIds[SocketioNamespaces.BASE] ?? '') : '';
    const socket = this.io.sockets.sockets.get(socketId);

    if (newHandler !== '') {
      const newHandlerObj = handlers.find((h) => h.constructor.name === newHandler);
      if (newHandlerObj === undefined) return false;
      newHandlerObj.registerEntity(entity);
      socket?.emit('handler_set', newHandlerObj.constructor.name);
    } else {
      socket?.emit('handler_remove');
      // eslint-disable-next-line no-param-reassign
      entity.currentHandler = '';
      entity.save().catch((e) => logger.error(e));
    }
    this.emitterStore.backofficeSyncEmitter.emit(
      `handler_${entity.constructor.name.toLowerCase()}_update`,
    );

    return true;
  }

  /**
   * Transmit a beat to all handlers. They can decide what to do with it
   * @param event
   */
  public beat(event: BeatEvent) {
    this.getHandlers().forEach((h) => {
      if (h.beat) h.beat(event);
    });
  }

  /**
   * Transmit a track change to all screen handlers,
   * as are the only ones who can do something with it
   * @param event
   */
  public changeTrack(event: TrackChangeEvent[]) {
    const handlers = this.getHandlers();
    handlers.forEach((h) => {
      if (h instanceof BaseScreenHandler && h.changeTrack) h.changeTrack(event);
    });
  }

  /**
   * Transmit an order change to all screen handlers
   * (like changeTrack())
   */
  public showOrders(event: ShowOrdersEvent) {
    const handlers = this.getHandlers();
    handlers.forEach((h) => {
      if (h instanceof BaseScreenHandler && h.showOrders) h.showOrders(event);
    });
  }

  /**
   * Resets all handlers to their initial state
   */
  public resetHandlers(): void {
    const handlers = this.getHandlers();
    handlers.forEach((h) => {
      h.reset();
    });
  }
}
