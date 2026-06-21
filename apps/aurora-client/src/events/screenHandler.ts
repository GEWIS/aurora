import { Socket, io } from 'socket.io-client';
import { Dispatch, SetStateAction } from 'react';
import { DefaultEventsMap } from 'socket.io';

export default function registerScreenHandler(
  setScreenSocket: Dispatch<SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap> | null>>,
) {
  const screenSocket = io('/screen', {
    path: '/socket.io/',
  });

  screenSocket.on('connect', () => {
    console.warn('SocketIO: connected to /screen');
    setScreenSocket(screenSocket);
  });
}
