import { FeatureEnabled, ServerSettingsStore } from '../server-settings';
import { ISettings } from '../server-settings/server-setting';
import { Order } from './entities';

/**
 * In memory store of all orders that should be propagated using Aurora.
 * Class methods are asynchronous, so this class can be more easily replaced
 * by for example a more persistent database store of orders in the future
 * if desired.
 */
@FeatureEnabled('Orders')
export default class OrderStore {
  private settingsStore: ServerSettingsStore;

  private _orders: Order[] = [];

  constructor() {
    this.settingsStore = ServerSettingsStore.getInstance();
  }

  /**
   * Remove all orders that have expired and should no longer be shown on screen
   * @private
   */
  private async removeExpiredOrders(): Promise<void> {
    this._orders = this._orders.filter((o) => {
      // Only keep orders which expiry time has not yet passed
      return new Date().getTime() < o.startTime.getTime() + o.timeoutSeconds * 1000;
    });
  }

  get orders(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      this.removeExpiredOrders()
        .then(() => resolve(this._orders))
        .catch(() => reject());
    });
  }

  /**
   * Add an order to the store
   * @param orderNumber Number of the order to propagate
   * @param timeoutSeconds Time after which the order should automatically be hidden
   */
  public async addOrder(orderNumber: number, timeoutSeconds?: number): Promise<void> {
    const index = this._orders.findIndex((o) => o.number === orderNumber);
    const timeout =
      timeoutSeconds ??
      (this.settingsStore.getSetting(
        'Orders.DefaultTimeoutSeconds',
      ) as ISettings['Orders.DefaultTimeoutSeconds']);

    if (index >= 0) {
      this._orders[index].startTime = new Date();
      this._orders[index].timeoutSeconds = timeout;
    } else {
      const order: Order = {
        number: orderNumber,
        startTime: new Date(),
        timeoutSeconds: timeout,
      };
      this._orders.push(order);
    }

    await this.removeExpiredOrders();
  }

  /**
   * Remove an order from the list of orders, if it exists
   * @param orderNumber
   */
  public async removeOrder(orderNumber: number): Promise<void> {
    this._orders = this._orders.filter((o) => o.number !== orderNumber);
    await this.removeExpiredOrders();
  }
}
