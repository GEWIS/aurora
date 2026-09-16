import 'reflect-metadata';
import { container, type DependencyContainer, type InjectionToken } from 'tsyringe';
import type { IocContainer, ServiceIdentifier } from '@tsoa/runtime';

/**
 * Container tsoa resolves controllers through.
 */
export const iocContainer: IocContainer = {
  get: <T>(controller: ServiceIdentifier<T>): T =>
    container.resolve<T>(controller as InjectionToken<T>),
};

/**
 * Bind a port to the instance that satisfies it.
 */
export function registerPort<T>(
  scope: DependencyContainer,
  port: abstract new (...args: never[]) => T,
  instance: T,
): void {
  scope.registerInstance(port as never, instance as never);
}

export { container };
