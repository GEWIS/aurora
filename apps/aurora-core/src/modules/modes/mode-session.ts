import HandlerManager from '../root/handler-manager';
import BaseHandler from '../root/base-handler';
import SubscribeEntity from '../root/entities/subscribe-entity';

export interface DeviceClaim {
  entities: SubscribeEntity[];
  handler: BaseHandler<SubscribeEntity>;
}

/**
 * The claim a running mode holds on a set of devices.
 */
export default class ModeSession {
  private readonly previousHandlers = new Map<SubscribeEntity, string>();

  private released = false;

  constructor(
    private readonly handlerManager: HandlerManager,
    private readonly claims: DeviceClaim[],
  ) {}

  /**
   * Hand every claimed device to its handler, remembering where each came from.
   */
  public claim(): void {
    this.claims.forEach(({ entities, handler }) => {
      entities.forEach((entity) => {
        const currentHandler = this.handlerManager.getHandler(entity);
        if (currentHandler) this.previousHandlers.set(entity, currentHandler);
        this.handlerManager.registerHandler(entity, handler.constructor.name);
      });
    });
  }

  /**
   * Return every device to the handler it was on before, or to none if it was unassigned.
   */
  public release(): void {
    if (this.released) return;
    this.released = true;

    this.claims.forEach(({ entities, handler }) => {
      entities.forEach((entity) => {
        if (this.handlerManager.getHandler(entity) !== handler.constructor.name) return;
        this.handlerManager.registerHandler(entity, this.previousHandlers.get(entity) ?? '');
      });
    });
  }
}
