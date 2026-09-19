import 'reflect-metadata';
import { container, type InjectionToken } from 'tsyringe';
import type { IocContainer, ServiceIdentifier } from '@tsoa/runtime';

/**
 * Container tsoa resolves controllers through.
 */
export const iocContainer: IocContainer = {
  get: <T>(controller: ServiceIdentifier<T>): T =>
    container.resolve<T>(controller as InjectionToken<T>),
};

export { container };
