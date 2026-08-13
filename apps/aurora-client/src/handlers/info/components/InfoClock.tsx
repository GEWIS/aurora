import { useEffect, useState } from 'react';
import { sBool, sStr, WidgetSettings } from '../settings';
import DigitalTime from './DigitalTime';
import AnalogClock from './AnalogClock';

const HOUR_MS = 60 * 60 * 1000;
const COUNTDOWN_WINDOW_HOURS = 44;
const DEFAULT_TZ = 'Europe/Amsterdam';

function pad(n: number): string {
  return Math.floor(Math.abs(n)).toString().padStart(2, '0');
}

interface Props {
  settings?: WidgetSettings;
}

/** Hours/minutes/seconds of `now` in the given IANA timezone. */
function zonedParts(now: Date, timeZone: string): { h: number; m: number; s: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
    const h = get('hour') % 24; // '24' can appear for midnight
    return { h, m: get('minute'), s: get('second') };
  } catch {
    return { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
  }
}

/**
 * Nearest July 1st (00:00) to `now`, looking at this year and next.
 */
function nearestJulyFirst(now: Date): Date {
  const thisYear = new Date(now.getFullYear(), 6, 1, 0, 0, 0);
  const nextYear = new Date(now.getFullYear() + 1, 6, 1, 0, 0, 0);
  return Math.abs(now.getTime() - thisYear.getTime()) <
    Math.abs(now.getTime() - nextYear.getTime())
    ? thisYear
    : nextYear;
}

/**
 * Clock + date. Supports a digital or analog face, a configurable timezone,
 * optional seconds/date and a 12/24-hour mode. Easter egg: within 44 hours
 * around July 1st, the digital clock becomes a signed HH:MM:SS countdown.
 */
export default function InfoClock({ settings }: Props) {
  const [now, setNow] = useState(new Date());

  const mode = sStr(settings, 'mode', 'digital');
  const timeZone = sStr(settings, 'timezone', DEFAULT_TZ);
  const showSeconds = sBool(settings, 'showSeconds', true);
  const showDate = sBool(settings, 'showDate', true);
  const use24h = sBool(settings, 'use24h', true);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { h, m, s } = zonedParts(now, timeZone);
  const dateText = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(now);

  if (mode === 'analog') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 font-raleway text-white text-shadow">
        <div className="min-h-0 flex-1">
          <AnalogClock hours={h} minutes={m} seconds={s} showSeconds={showSeconds} />
        </div>
        {showDate && <div className="shrink-0 text-xl opacity-80">{dateText}</div>}
      </div>
    );
  }

  const target = nearestJulyFirst(now);
  const diffMs = target.getTime() - now.getTime();
  const withinWindow = Math.abs(diffMs) <= COUNTDOWN_WINDOW_HOURS * HOUR_MS;

  if (withinWindow) {
    const sign = diffMs >= 0 ? '-' : '+';
    const totalSeconds = Math.abs(diffMs) / 1000;
    return (
      <div className="flex flex-col items-end font-raleway text-white text-shadow">
        <DigitalTime
          className="text-7xl tracking-tight"
          value={`${sign}${pad(totalSeconds / 3600)}:${pad((totalSeconds % 3600) / 60)}:${pad(totalSeconds % 60)}`}
        />
        <div className="text-2xl opacity-80">until 1 July</div>
      </div>
    );
  }

  const displayHour = use24h ? h : h % 12 || 12;
  const time = showSeconds ? `${pad(displayHour)}:${pad(m)}:${pad(s)}` : `${pad(displayHour)}:${pad(m)}`;

  return (
    <div className="flex flex-col items-end font-raleway text-white text-shadow">
      <DigitalTime className="text-7xl tracking-tight" value={time} />
      {showDate && <div className="text-2xl opacity-80">{dateText}</div>}
    </div>
  );
}
