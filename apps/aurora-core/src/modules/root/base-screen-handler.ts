import { Namespace } from 'socket.io';
type AnyEventParams = any[];
import BaseHandler from './base-handler';
import Screen from './entities/screen';
import { type TrackChangeEvent } from '../events/music-emitter-events';
import { type ShowOrdersEvent } from '../events/order-emitter';
import { SocketioNamespaces } from '../../socketio-namespaces';
import { FeatureEnabled } from '../server-settings';

export default abstract class BaseScreenHandler extends BaseHandler<Screen> {
  constructor(private socket: Namespace) {
    super();
  }

  abstract changeTrack(event: TrackChangeEvent[]): void;

  @FeatureEnabled('Orders')
  public showOrders(event: ShowOrdersEvent): void {
    this.sendEvent('orders', event);
  }

  /**
   * Send an event with the given name and given arguments to the given screen
   * @param screen
   * @param eventName
   * @param args
   * @protected
   */
  protected sendEventToScreen(screen: Screen, eventName: string, ...args: AnyEventParams) {
    const socketId = screen.getSocketId(this.socket.name as SocketioNamespaces);
    this.socket.sockets.get(socketId || '')?.emit(eventName, args);
  }

  /**
   * Send an event with the given name and given arguments to all screens
   * using this handler
   * @param eventName
   * @param args
   * @protected
   */
  protected sendEvent(eventName: string, ...args: AnyEventParams) {
    this.entities.forEach((screen) => {
      this.sendEventToScreen(screen, eventName, ...args);
    });
  }
}
