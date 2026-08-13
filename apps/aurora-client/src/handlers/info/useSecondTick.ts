import { useEffect, useState } from 'react';

/**
 * A `Date` that updates once a second, aligned to the wall-clock second.
 *
 * A plain `setInterval(…, 1000)` fires one second after the component happened
 * to mount, so two widgets showing the same moment — the clock and a countdown —
 * repaint at different offsets within the second and can disagree for as long as
 * that offset lasts. Scheduling each tick for the next whole second instead
 * keeps every widget on the same boundary.
 */
export default function useSecondTick(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setNow(new Date());
          schedule();
        },
        1000 - (Date.now() % 1000),
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return now;
}
