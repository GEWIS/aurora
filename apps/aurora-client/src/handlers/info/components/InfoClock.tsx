import { CSSProperties } from 'react';
import { formatHhMmSs } from '../countdown';
import { sBool, sStr, WidgetSettings } from '../settings';
import useSecondTick from '../useSecondTick';
import DigitalTime, { timeEmWidth } from './DigitalTime';
import AnalogClock from './AnalogClock';

const HOUR_MS = 60 * 60 * 1000;
const COUNTDOWN_WINDOW_HOURS = 44;
const DEFAULT_TZ = 'Europe/Amsterdam';

/** Average character width (em) of the date/label lines, which use no fixed cells. */
const LABEL_CHAR_EM = 0.52;

/** The widget fills its card and is queried for both axes, so text can scale to either. */
const CONTAINER: CSSProperties = { containerType: 'size' };

/** Caption size and gap as a fraction of the time above it. */
const CAPTION_RATIO = 0.26;
const CAPTION_GAP_RATIO = 0.08;

/**
 * Font size that fills the card: as wide as `em` characters allow, capped at
 * `heightPct` of the card height so a short, wide card stays inside its bounds.
 */
function fitFont(em: number, heightPct: number): string {
  return `min(${(96 / em).toFixed(2)}cqw, ${heightPct}cqh)`;
}

/** Width (cqw) at which a proportional label line still fits the card. */
function labelWidthFit(text: string): string {
  return `${(96 / (text.length * LABEL_CHAR_EM)).toFixed(2)}cqw`;
}

/**
 * The line under the digital time. Sized off the time itself rather than the
 * card, so the pair keeps its proportions as the widget grows, and still capped
 * to the card width for long dates.
 */
function captionStyle(text: string, timeFont: string): CSSProperties {
  return {
    fontSize: `min(calc(${timeFont} * ${CAPTION_RATIO}), ${labelWidthFit(text)})`,
    marginTop: `calc(${timeFont} * ${CAPTION_GAP_RATIO})`,
  };
}

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
  return Math.abs(now.getTime() - thisYear.getTime()) < Math.abs(now.getTime() - nextYear.getTime())
    ? thisYear
    : nextYear;
}

/**
 * Clock + date. Supports a digital or analog face, a configurable timezone,
 * optional seconds/date and a 12/24-hour mode. Easter egg: within 44 hours
 * around July 1st, the digital clock becomes a signed HH:MM:SS countdown.
 */
export default function InfoClock({ settings }: Props) {
  const now = useSecondTick();

  const mode = sStr(settings, 'mode', 'digital');
  const timeZone = sStr(settings, 'timezone', DEFAULT_TZ);
  const showSeconds = sBool(settings, 'showSeconds', true);
  const showDate = sBool(settings, 'showDate', true);
  const use24h = sBool(settings, 'use24h', true);

  const { h, m, s } = zonedParts(now, timeZone);
  const dateText = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(now);

  if (mode === 'analog') {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 font-raleway text-white text-shadow"
        style={CONTAINER}
      >
        <div className="min-h-0 flex-1">
          <AnalogClock hours={h} minutes={m} seconds={s} showSeconds={showSeconds} />
        </div>
        {showDate && (
          <div
            className="shrink-0 leading-none opacity-80"
            style={{ fontSize: `min(${labelWidthFit(dateText)}, 12cqh)` }}
          >
            {dateText}
          </div>
        )}
      </div>
    );
  }

  const target = nearestJulyFirst(now);
  const diffMs = target.getTime() - now.getTime();
  const withinWindow = Math.abs(diffMs) <= COUNTDOWN_WINDOW_HOURS * HOUR_MS;

  if (withinWindow) {
    const sign = diffMs >= 0 ? '-' : '+';
    const countdown = `${sign}${formatHhMmSs(diffMs)}`;
    const label = 'until 1 July';
    const timeFont = fitFont(timeEmWidth(countdown), 60);
    return (
      <div
        className="flex h-full w-full flex-col items-end justify-center font-raleway text-white text-shadow"
        style={CONTAINER}
      >
        <DigitalTime
          className="leading-none tracking-tight"
          style={{ fontSize: timeFont }}
          value={countdown}
        />
        <div className="leading-none opacity-80" style={captionStyle(label, timeFont)}>
          {label}
        </div>
      </div>
    );
  }

  const displayHour = use24h ? h : h % 12 || 12;
  const time = showSeconds
    ? `${pad(displayHour)}:${pad(m)}:${pad(s)}`
    : `${pad(displayHour)}:${pad(m)}`;
  const timeFont = fitFont(timeEmWidth(time), showDate ? 60 : 80);

  return (
    <div
      className="flex h-full w-full flex-col items-end justify-center font-raleway text-white text-shadow"
      style={CONTAINER}
    >
      <DigitalTime
        className="leading-none tracking-tight"
        style={{ fontSize: timeFont }}
        value={time}
      />
      {showDate && (
        <div className="leading-none opacity-80" style={captionStyle(dateText, timeFont)}>
          {dateText}
        </div>
      )}
    </div>
  );
}
