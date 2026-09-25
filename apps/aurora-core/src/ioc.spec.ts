import { describe, it, expect, beforeEach } from 'vitest';
import { container, iocContainer } from './ioc';
import { HandlerController } from './modules/root/handler-controller';
import HandlerManager from './modules/root/handler-manager';

describe('tsoa IoC container', () => {
  beforeEach(() => {
    void container.unbindAllAsync();
  });

  it('resolves a controller and injects what the composition root registered', () => {
    const handlerManager = { getHandlers: () => [] } as unknown as HandlerManager;
    container.bind(HandlerManager as unknown as never).toConstantValue(handlerManager);

    const controller = iocContainer.get(HandlerController) as HandlerController;

    expect(controller).toBeInstanceOf(HandlerController);
    expect(controller.getAudioHandlers()).toEqual([]);
  });

  it('fails loudly when a dependency was never registered', () => {
    expect(() => iocContainer.get(HandlerController)).toThrowError();
  });
});
