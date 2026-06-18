import { Controller, Security as TsoaSecurity } from '@tsoa/runtime';
import { SecurityNames } from '../../helpers/security';
import { IntegrationEndpointManager } from './integration';

/**
 * Add TSOA Authorization to a controller or a controller endpoint.
 * In case of SecurityNames.Integration, register the endpoint for integration users.
 * @param name
 * @param scopes
 * @constructor
 */
function Security(
  name:
    | string
    | {
        [name: string]: string[];
      },
  scopes?: string[],
): ClassDecorator & MethodDecorator {
  return (...args: [any] | [Object, string | symbol, TypedPropertyDescriptor<any>]) => {
    // Class decorator
    if (args.length === 1) {
      const target = args[0] as Function;

      // Security for integrations can only be used on controller endpoints
      if (name === SecurityNames.INTEGRATION) {
        throw new Error('Integration security decorator can only be used on controller endpoints');
      }
    }

    // Method decorator
    if (args.length === 3) {
      const target = args[0] as Object;
      const propertyKey = args[1] as string | symbol;
      const descriptor = args[2] as TypedPropertyDescriptor<any>;
      // Security for integrations
      if (name === SecurityNames.INTEGRATION) {
        // Can only be assigned to controller methods
        if (!(target instanceof Controller)) {
          throw new Error(
            'Integration security decorator can only be used on controller endpoints',
          );
        }

        // Scope should equal the method name. We cannot derive this immediately from the propertyKey,
        // because TSOA reads a controller file as a AST and thus does run the actual file and its
        // decorators. However, overriding the @Security() decorator works!
        if (!scopes || scopes?.length !== 1 || scopes[0] !== propertyKey) {
          throw new Error(
            `Integration security decorator's scope needs to equal the method's name (${scopes} != ${String(propertyKey)})`,
          );
        }

        IntegrationEndpointManager.getInstance().addIntegrationMethod(scopes[0]);
      }
    }

    // @ts-ignore Args can be 1 or 3 items long
    return TsoaSecurity(name, scopes)(...args);
  };
}

const s: typeof TsoaSecurity = Security;

export default s;
