import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { BorrelModeState, getBorrelMode } from '@gewis/aurora-api-client';

/**
 * Whether borrel mode is currently active. Fetched on mount and after every
 * reconnect (events sent while disconnected are lost), and kept up to date by
 * the server's borrel_mode events in between.
 */
export default function useBorrelMode(socket: Socket): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    let eventCount = 0;

    const fetchState = () => {
      const eventCountAtFetch = eventCount;
      void getBorrelMode()
        .then((res) => res.data)
        .catch((err) => {
          console.error(err);
          return undefined;
        })
        .then((data) => {
          if (!active || eventCount !== eventCountAtFetch) return;
          setEnabled(data?.enabled ?? false);
        });
    };

    const handleEvent = (state: BorrelModeState) => {
      eventCount += 1;
      setEnabled(state.enabled);
    };

    fetchState();
    socket.on('borrel_mode', handleEvent);
    socket.on('connect', fetchState);

    return () => {
      active = false;
      socket.off('borrel_mode', handleEvent);
      socket.off('connect', fetchState);
    };
  }, [socket]);

  return enabled;
}
