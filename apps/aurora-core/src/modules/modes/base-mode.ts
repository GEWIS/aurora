import { LightsGroup } from '../lights/entities';
import { Audio, Screen } from '../root/entities';
import SubscribeEntity from '../root/entities/subscribe-entity';
import HandlerManager from '../root/handler-manager';
import BaseLightsHandler from '../handlers/base-lights-handler';
import BaseAudioHandler from '../handlers/base-audio-handler';
import BaseScreenHandler from '../handlers/base-screen-handler';

export default abstract class BaseMode<
  T extends BaseLightsHandler,
  U extends BaseScreenHandler,
  V extends BaseAudioHandler,
> {
  protected handlerManager = HandlerManager.getInstance();

  protected lightsHandler: T;

  protected screenHandler: U;

  protected audioHandler: V;

  private previousHandlers = new Map<SubscribeEntity, string>();

  /**
   * Assign the given entities to the given handlers
   */
  protected constructor(
    private _lights: LightsGroup[],
    private _screens: Screen[],
    private _audios: Audio[],
    protected readonly lightsHandlerName: string,
    protected readonly screenHandlerName: string,
    protected readonly audioHandlerName: string,
  ) {
    _lights.forEach((lightsGroup) => {
      this.cachePreviousHandler(lightsGroup);
      this.handlerManager.registerHandler(lightsGroup, lightsHandlerName);
    });
    _screens.forEach((screen) => {
      this.cachePreviousHandler(screen);
      this.handlerManager.registerHandler(screen, screenHandlerName);
    });
    _audios.forEach((audio) => {
      this.cachePreviousHandler(audio);
      this.handlerManager.registerHandler(audio, audioHandlerName);
    });

    this.lightsHandler = this.handlerManager
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === lightsHandlerName) as T;
    if (!this.lightsHandler)
      throw new Error(`LightsHandler with name "${lightsHandlerName}" not found.`);

    this.screenHandler = this.handlerManager
      .getHandlers(Screen)
      .find((h) => h.constructor.name === screenHandlerName) as U;
    if (!this.lightsHandler)
      throw new Error(`ScreenHandler with name "${screenHandlerName}" not found.`);

    this.audioHandler = this.handlerManager
      .getHandlers(Audio)
      .find((h) => h.constructor.name === audioHandlerName) as V;
    if (!this.lightsHandler)
      throw new Error(`AudioHandler with name "${audioHandlerName}" not found.`);
  }

  /**
   * Remember which handler an entity was on, so it can be given back on destroy.
   * Entities on no handler are not recorded, and stay unassigned on destroy.
   */
  private cachePreviousHandler<T extends SubscribeEntity>(entity: T): void {
    const currentHandler = this.handlerManager.getHandler(entity);
    if (currentHandler) {
      this.previousHandlers.set(entity, currentHandler);
    }
  }

  /**
   * Return the entities to the handler they were on before this mode claimed
   * them, or to no handler if they were not on one.
   */
  private releaseEntities<T extends SubscribeEntity>(entities: T[], handlerName: string): void {
    entities.forEach((entity) => {
      if (this.handlerManager.getHandler(entity) !== handlerName) return;
      this.handlerManager.registerHandler(entity, this.previousHandlers.get(entity) ?? '');
    });
  }

  /**
   * Unregister all listeners from the handler corresponding to this mode.
   */
  destroy(): void {
    this.releaseEntities(this._lights, this.lightsHandlerName);
    this.releaseEntities(this._screens, this.screenHandlerName);
    this.releaseEntities(this._audios, this.audioHandlerName);
  }

  // Getter function, as we might add more entities to the lightsHandler later
  get lights(): LightsGroup[] {
    return this.lightsHandler.entities;
  }

  // Getter function, as we might add more entities to the screenHandler later
  get screens(): Screen[] {
    return this.screenHandler.entities;
  }

  // Getter function, as we might add more entities to the audioHandler later
  get audios(): Audio[] {
    return this.audioHandler.entities;
  }
}
