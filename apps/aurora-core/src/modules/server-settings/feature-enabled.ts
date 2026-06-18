import { Controller } from 'tsoa';
import { Middlewares } from '@tsoa/runtime';
import { NextFunction, Request as ExRequest, Response as ExResponse } from 'express';
import { ISettings } from './server-setting';
import ServerSettingsStore from './server-settings-store';
import logger from '../../logger';
import BaseHandler from '../handlers/base-handler';
import FeatureFlagManager from './feature-flag-manager';

type ClassDecoratorParams<T extends { new (...args: any[]): {} }> = [T];
type FunctionDecoratorParams<T> = [
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
];

type DecoratorParams = ClassDecoratorParams<any> | FunctionDecoratorParams<any>;

export default function FeatureEnabled(setting: keyof ISettings): ClassDecorator & MethodDecorator {
  // Register this setting as a (used) feature flag
  const store = ServerSettingsStore.getInstance();
  const featureFlagManager = FeatureFlagManager.getInstance();
  featureFlagManager.registerFeatureFlag(setting);

  const endpointMiddleware = (req: ExRequest, res: ExResponse, next: NextFunction) => {
    if (!store.isInitialized()) {
      logger.error('Server Settings Store is not initialized');
      res.status(500).send('Internal server error.');
      return;
    }

    const enabled = featureFlagManager.flagIsEnabled(setting);
    if (!enabled) {
      res.status(409).send(`Endpoint is disabled by setting "${setting}".`);
      return;
    }

    next();
  };

  return (...args: DecoratorParams): any => {
    // The decorator is assigned to a controller
    if (args.length === 1 && args[0].prototype instanceof Controller) {
      // TSOA Middleware, which already distinguishes between method and class decorators
      // by itself. Therefore, we do not have to do anything :)
      return Middlewares(endpointMiddleware)(args[0]);
    }
    // The decorator is assigned to a controller method
    if (args.length === 3 && args[0] instanceof Controller) {
      return Middlewares(endpointMiddleware);
    }

    // The decorator is assigned to a handler
    if (args.length === 1 && args[0].prototype instanceof BaseHandler) {
      // It is not possible to assign such a value to the class itself, because decorators can only
      // access class instances (objects). Static attributes for example cannot be changed by
      // decorators. Therefore, if we want to prevent object creation and not delete a handler after
      // its creation, we should keep track of these restrictions somewhere else.
      featureFlagManager.registerHandlerWithFeatureFlag(args[0], setting);
      return;
    }

    // Decorator is assigned to a regular class
    if (args.length === 1) {
      const constr = args[0] as ClassDecoratorParams<any>[0];
      // Override the constructor. More specifically, we want to perform the
      // feature flag check before actually creating the object.
      return class extends constr {
        constructor(...constructorArgs: any[]) {
          store.throwIfNotInitialized();

          const enabled = featureFlagManager.flagIsEnabled(setting);
          if (!enabled) {
            throw new Error(`Class "${constr.name}" is disabled by setting "${setting}"`);
          }

          super(...constructorArgs);
        }
      };
    }

    // Decorator is a method
    const [, propertyKey, descriptor] = args;
    const originalMethod = descriptor.value;
    // Override the method's implementation. More specifically, we only execute
    // the method if the feature flag has been evaluated.
    descriptor.value = function executeMethod(...methodArgs: any[]) {
      const store = ServerSettingsStore.getInstance();
      store.throwIfNotInitialized();

      const enabled = featureFlagManager.flagIsEnabled(setting);
      if (!enabled) {
        throw new Error(`Method "${propertyKey.toString()}" is disabled by setting "${setting}"`);
      }
      return originalMethod.apply(this, methodArgs);
    };
    return descriptor;
  };
}
