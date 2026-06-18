import { BaseEventEmitter } from './base-event-emitter';
import { ShowOrdersEvent } from './order-emitter-events';

export class OrderEmitter extends BaseEventEmitter {
  showOrders(showOrdersEvent: ShowOrdersEvent): boolean {
    return super.emit('orders', showOrdersEvent);
  }
}
