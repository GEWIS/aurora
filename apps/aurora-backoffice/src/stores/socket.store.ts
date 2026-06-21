import { io, Socket } from 'socket.io-client';
import { defineStore } from 'pinia';

interface SocketStore {
  rootSocket?: Socket;
  backofficeSocket?: Socket;
  backofficeBeatSocket?: Socket;
}

export const useSocketStore = defineStore('socket', {
  state: (): SocketStore => ({
    rootSocket: undefined,
    backofficeSocket: undefined,
  }),
  getters: {},
  actions: {
    async connect() {
      const rootSocket = io('/', { path: '/socket.io/' });
      const backofficeSocket = io('/backoffice', { path: '/socket.io/' });

      const promise1 = new Promise<void>((resolve) => {
        rootSocket.on('connect', () => {
          console.info('SocketIO: connected to /');
          this.rootSocket = rootSocket;
          resolve();
        });
      });
      const promise2 = new Promise<void>((resolve) => {
        backofficeSocket.on('connect', () => {
          console.info('SocketIO: connected to /backoffice');
          this.backofficeSocket = backofficeSocket;
          resolve();
        });
      });
      return Promise.all([promise1, promise2]);
    },
    async connectBeat() {
      const beatSocket = io('/backoffice-beat', { path: '/socket.io/' });
      return new Promise<void>((resolve) => {
        beatSocket.on('connect', () => {
          console.info('SocketIO: connected to /backoffice-beat');
          this.backofficeBeatSocket = beatSocket;
          resolve();
        });
      });
    },
    disconnectBeat() {
      if (!this.backofficeBeatSocket) {
        console.error('SocketIO: Already disconnected from /backoffice-beat!');
        return;
      }
      this.backofficeBeatSocket.removeAllListeners();
      this.backofficeBeatSocket.disconnect();
      this.backofficeBeatSocket = undefined;
    },
  },
});
