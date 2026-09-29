import { Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { getScreenFilter, ScreenFilterState } from '@gewis/aurora-api-client';

const MAX_WARMTH_OPACITY = 0.5;

export interface ScreenFilterEvent extends ScreenFilterState {
  transitionSeconds: number;
}

interface Props {
  socket: Socket;
}

/**
 * Global dimming / blue light filter, rendered on top of all handlers.
 * An overlay is used instead of a CSS filter, because the latter breaks
 * fixed positioning of children and is expensive on videos.
 */
export default function ScreenFilterOverlay({ socket }: Props) {
  const [filter, setFilter] = useState<ScreenFilterEvent>({
    brightness: 100,
    warmth: 0,
    transitionSeconds: 0,
  });

  useEffect(() => {
    let active = true;
    let eventCount = 0;

    const fetchFilter = () => {
      const eventCountAtFetch = eventCount;
      getScreenFilter()
        .then((res) => {
          if (!active || !res.data || eventCount !== eventCountAtFetch) return;
          setFilter({ ...res.data, transitionSeconds: 0 });
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const handleFilterEvent = (event: ScreenFilterEvent) => {
      eventCount += 1;
      setFilter(event);
    };

    fetchFilter();
    socket.on('screen_filter', handleFilterEvent);
    socket.on('connect', fetchFilter);

    return () => {
      active = false;
      socket.off('screen_filter', handleFilterEvent);
      socket.off('connect', fetchFilter);
    };
  }, [socket]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[9998] transition-opacity ease-linear"
        style={{
          transitionDuration: `${filter.transitionSeconds}s`,
          backgroundColor: 'rgb(255, 140, 0)',
          mixBlendMode: 'multiply',
          opacity: (filter.warmth / 100) * MAX_WARMTH_OPACITY,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[9999] bg-black transition-opacity ease-linear"
        style={{
          transitionDuration: `${filter.transitionSeconds}s`,
          opacity: 1 - filter.brightness / 100,
        }}
      />
    </>
  );
}
