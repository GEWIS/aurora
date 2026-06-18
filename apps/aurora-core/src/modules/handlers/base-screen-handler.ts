import { Namespace } from 'socket.io';
import { EventParams } from 'socket.io/dist/typed-events';
import BaseHandler from './base-handler';
import Screen from '../root/entities/screen';
import { TrackChangeEvent } from '../events/music-emitter-events';
import { SocketioNamespaces } from '../../socketio-namespaces';
import { ShowOrdersEvent } from '../events/order-emitter-events';
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
  protected sendEventToScreen(screen: Screen, eventName: string, ...args: EventParams<any, any>) {
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
  protected sendEvent(eventName: string, ...args: EventParams<any, any>) {
    this.entities.forEach((screen) => {
      this.sendEventToScreen(screen, eventName, ...args);
    });
  }
}
