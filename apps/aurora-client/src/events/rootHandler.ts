import { io } from 'socket.io-client';
import { Dispatch, SetStateAction } from 'react';
import { Handlers } from '../HandlerSwitcher';

export default function registerRootHandler(setCurrentHandler: Dispatch<SetStateAction<Handlers | null>>) {
  const rootSocket = io('/', {
    path: '/socket.io/',
  });

  rootSocket.on('connect', () => {
    console.warn('SocketIO: connected to /');
  });

  rootSocket.on('handler_set', (handler: Handlers) => {
    console.warn(`Current handler: ${handler}`);
    setCurrentHandler(handler);
  });

  rootSocket.on('handler_remove', () => {
    setCurrentHandler(null);
  });

  const startTime = Date.now();
  const status = {
    uptimeSeconds: 0,
    systemTimestamp: startTime,
    latencyMilliseconds: 0,
  };
  setInterval(() => {
    status.systemTimestamp = Date.now();
    status.uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    rootSocket.emit('status:update', status, () => {
      status.latencyMilliseconds = Math.floor((Date.now() - status.systemTimestamp) / 2);
    });
  }, 5 * 1000);
}
