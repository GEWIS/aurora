import { useEffect, useState } from 'react';
import { sBool, WidgetSettings } from '../settings';
import { nextBeerTime } from './RoomStatusWidget';

interface Props {
  beerTime: string | null;
  lastCall: string | null;
  settings?: WidgetSettings;
}

/** Beer glass: a solid amber body with a solid white foam head on top. */
const BEER_GLASS_BG = 'linear-gradient(to top, #eb9c07 0% 74%, #fff9ed 82% 100%)';

/**
 * Placeable beer-time panel (as in the sketch): "Not today" when no beer time is
 * set, "Beer starts at HH:MM" + a remaining-time line before beer time, and
 * "It's beer 'o clock" once it has passed. In alt mode the panel background turns
 * into a filled beer glass (amber beer with a white foam head) at beer time. The
 * full-screen countdown overlay is a separate modal widget.
 */
export default function BeerPanel({ beerTime, lastCall, settings }: Props) {
  const [now, setNow] = useState(new Date());

  const altColor = sBool(settings, 'altColor', true);
  const showIcon = sBool(settings, 'showIcon', true);
  const showLastCall = sBool(settings, 'showLastCall', true);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = beerTime ? nextBeerTime(beerTime, now) : null;

  let headline = 'Not today';
  let sub: string | null = null;
  let isBeerTime = false;

  if (target) {
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
      headline = "It's beer 'o clock";
      sub = showLastCall && lastCall ? `Last call at ${lastCall}` : null;
      isBeerTime = true;
    } else {
      const hrs = Math.floor(diffMs / 3_600_000);
      const mins = Math.floor((diffMs % 3_600_000) / 60_000);
      headline = `Beer starts at ${beerTime}`;
      sub = `Still ${hrs} hrs and ${mins} mnts to go`;
    }
  }

  // In alt mode, once beer time has passed the panel becomes a beer glass.
  const beerGlass = altColor && isBeerTime;

  return (
    <div className="relative flex h-full w-full items-center overflow-hidden font-raleway">
      {beerGlass && (
        <div
          data-testid="beer-glass"
          className="pointer-events-none absolute inset-0"
          style={{ background: BEER_GLASS_BG }}
        />
      )}
      <div
        className={`relative z-10 flex h-full w-full items-center gap-3 p-4 ${
          beerGlass ? 'text-amber-950' : 'text-white text-shadow'
        }`}
      >
        {showIcon && (
          <img
            src={isBeerTime ? '/base/beer-full.svg' : '/base/beer-empty.svg'}
            alt="beer"
            className="h-12 w-12 shrink-0"
          />
        )}
        <div className="flex min-w-0 flex-col justify-center">
          <div className="text-3xl font-semibold">{headline}</div>
          {sub && <div className="mt-1 text-lg opacity-80">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
