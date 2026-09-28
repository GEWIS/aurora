import { OrderEmitter } from '../events/order-emitter';
import OrderStore from './order-store';

export default class OrderManager {
  private static instance: OrderManager;

  private orderStore: OrderStore;

  private orderEmitter: OrderEmitter;

  public static getInstance(): OrderManager {
    if (!this.instance) {
      this.instance = new OrderManager();
    }
    return this.instance;
  }

  public init(orderEmitter: OrderEmitter) {
    if (this.orderEmitter) throw new Error('OrderEmitter is already initialized');
    this.orderEmitter = orderEmitter;
    this.orderStore = new OrderStore();
  }

  public async getOrders() {
    return this.orderStore.orders;
  }

  public async addOrder(orderNumber: number, timeoutSeconds?: number) {
    await this.orderStore.addOrder(orderNumber, timeoutSeconds);
    const orders = await this.orderStore.orders;
    this.orderEmitter.showOrders({ orders });
    return orders;
  }

  public async removeOrder(orderNumber: number) {
    await this.orderStore.removeOrder(orderNumber);
    const orders = await this.orderStore.orders;
    this.orderEmitter.showOrders({ orders });
    return orders;
  }
}
