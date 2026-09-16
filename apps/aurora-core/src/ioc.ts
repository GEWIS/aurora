import 'reflect-metadata';
import { Container, type Newable } from 'inversify';
import type { IocContainer, ServiceIdentifier } from '@tsoa/runtime';

/**
 * Container tsoa resolves controllers through.
 */
export const container = new Container();

export const iocContainer: IocContainer = {
  get: <T>(controller: ServiceIdentifier<T>): T => {
    const newable = controller as Newable<T>;
    if (!container.isBound(newable)) {
      container.bind(newable).toSelf();
    }
    return container.get<T>(newable);
  },
};

/**
 * Bind a port to the instance that satisfies it.
 */
export function registerPort<T>(
  scope: Container,
  port: abstract new (...args: never[]) => T,
  instance: T,
): void {
  scope.bind(port).toConstantValue(instance);
}

