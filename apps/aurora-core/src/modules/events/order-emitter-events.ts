import { Order } from '../orders/entities';

export interface ShowOrdersEvent {
  orders: Order[];
}
