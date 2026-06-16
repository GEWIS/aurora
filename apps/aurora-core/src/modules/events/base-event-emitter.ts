import { EventEmitter } from 'node:events';
import logger from '../../logger';

/**
 * Base emitter class to be used to transmit events within Aurora Core. These emitters are not
 * meant to emit events to optional listeners; a warning will be logged if an event is emitted,
 * but no one is listening for that event.
 */
export abstract class BaseEventEmitter extends EventEmitter {
  emit(eventName: string | symbol, ...args: any[]): boolean {
    if (this.listeners(eventName).length === 0) {
      logger.error(`No listeners found for event "${eventName.toString()}".`);
    }
    return super.emit(eventName, ...args);
  }
}
