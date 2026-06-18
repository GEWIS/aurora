import { Socket } from 'socket.io';
import { AuthUser } from '../auth';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';
import dataSource from '../../database';
import { Audio, LightsController, Screen } from './entities';
import logger from '../../logger';
import SubscribeEntity from './entities/subscribe-entity';

interface StatusUpdate {
  uptimeSeconds: number;
  systemTimestamp: number;
  latencyMilliseconds: number;
}

export default class EntityStatusManager {
  constructor(private backofficeEmitter: BackofficeSyncEmitter) {}

  /**
   * Add new socket connection
   * @param socket
   */
  public async addSocketConnection(socket: Socket) {
    const user = (socket.request as any).user;
    socket.on('status:update', (payload: StatusUpdate, callback: () => void) => {
      this.updateStatus(user, payload)
        .then(() => callback())
        .catch((e) => logger.error(e));
    });
  }

  /**
   * Remove socket connection
   * @param socket
   */
  public async removeSocketConnection(socket: Socket) {
    socket.removeAllListeners('status:update');
  }

  /**
   * Forward status update to backoffice
   * @param user
   * @param status
   * @private
   */
  private async updateStatus(user: AuthUser, update: StatusUpdate) {
    const status = {
      coreTimestamp: Date.now(),
      ...update,
    };

    if (user.audioId) {
      this.backofficeEmitter.emit('status:updated', {
        type: 'audio',
        id: user.audioId,
        status,
      });
    }
    if (user.screenId) {
      this.backofficeEmitter.emit('status:updated', {
        type: 'screen',
        id: user.screenId,
        status,
      });
    }
    if (user.lightsControllerId) {
      this.backofficeEmitter.emit('status:updated', {
        type: 'lights_controller',
        id: user.lightsControllerId,
        status,
      });
    }
  }
}
