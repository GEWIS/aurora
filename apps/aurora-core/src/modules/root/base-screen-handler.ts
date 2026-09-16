import { Namespace } from 'socket.io';
import { EventParams } from 'socket.io/dist/typed-events';
import BaseHandler from './base-handler';
import ScreenChannel from '../plugins/ports/screen-channel';
import Screen from './entities/screen';
import { TrackChangeEvent } from '../events/music-emitter-events';
import { ShowOrdersEvent } from '../events/order-emitter';
import { SocketioNamespaces } from '../../socketio-namespaces';
import { FeatureEnabled } from '../server-settings';

export default abstract class BaseScreenHandler
  extends BaseHandler<Screen>
  implements ScreenChannel
{
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
   * Deliver an event to every screen this handler currently holds.
   */
  public emit(event: string, payload?: unknown): void {
    // Forward no argument at all when there is no payload: `sendEvent` spreads its rest
    // parameter onto the socket, so passing `undefined` would put it on the wire.
    if (payload === undefined) {
      this.sendEvent(event);
      return;
    }

    this.sendEvent(event, payload);
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
