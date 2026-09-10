import { BaseEventEmitter } from './base-event-emitter';

// Structural duplicate of `modules/orders`' `Order` shape, kept here (rather than
// importing `Order`) so this leaf module does not depend on `orders`; `Order` satisfies
// this shape structurally, so no import is needed at the call site either.
export interface OrderSummary {
  number: number;
  startTime: Date;
  timeoutSeconds: number;
}

export interface ShowOrdersEvent {
  orders: OrderSummary[];
}

export class OrderEmitter extends BaseEventEmitter {
  showOrders(showOrdersEvent: ShowOrdersEvent): boolean {
    return super.emit('orders', showOrdersEvent);
  }
}
