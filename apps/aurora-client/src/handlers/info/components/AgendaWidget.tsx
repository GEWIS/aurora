import { useEffect, useState } from 'react';
import { AgendaEvent, getInfoAgenda } from '@gewis/aurora-api-client';
import VerticalScroll from '../../../components/VerticalScroll';
import { sBool, sStr, WidgetSettings } from '../settings';
import useCachedResource from '../useCachedResource';

interface Props {
  events: AgendaEvent[];
  settings?: WidgetSettings;
}

function hhmm(iso: string): string {
  const date = new Date(iso);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export type EventStatus = 'past' | 'now' | 'upcoming';

export function eventStatus(event: AgendaEvent, now: Date): EventStatus {
  const t = now.getTime();
  const start = Date.parse(event.start);
  if (t < start) return 'upcoming';
  if (event.end && t < Date.parse(event.end)) return 'now';
  return 'past';
}

function progress(event: AgendaEvent, now: Date): number {
  if (!event.end) return 0;
  const start = Date.parse(event.start);
  const span = Date.parse(event.end) - start;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, ((now.getTime() - start) / span) * 100));
}

const CARD_STYLE: Record<EventStatus | 'next', string> = {
  now: 'border-green-400 bg-white/20',
  next: 'border-amber-400 bg-white/10',
  upcoming: 'border-white/30 bg-white/10',
  past: 'border-white/10 bg-white/10 opacity-50',
};

export default function AgendaWidget({ events: initialEvents, settings }: Props) {
  const showTime = sBool(settings, 'showTime', true);
  const showEndTime = sBool(settings, 'showEndTime', false);
  const hidePast = sBool(settings, 'hidePast', false);
  const calendarUrl = sStr(settings, 'calendarUrl', '');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Self-fetch today's events from the configured calendar (per-widget setting).
  // Without one the widget follows the screen-wide agenda the core broadcasts.
  const events = useCachedResource(
    calendarUrl ? `agenda:${calendarUrl}` : null,
    async () => (await getInfoAgenda({ query: { url: calendarUrl } })).data,
    5 * 60_000,
    initialEvents,
  );

  const items = [...events]
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .map((event) => ({ event, status: eventStatus(event, now) }))
    .filter(({ status }) => !hidePast || status !== 'past');
  const nextIndex = items.findIndex(({ status }) => status === 'upcoming');

  return (
    <VerticalScroll visible items={items.length} scrollEmptySpace>
      <div className="flex flex-col gap-2 font-raleway text-white">
        {items.length === 0 && (
          <div className="text-white/60 text-2xl">Nothing scheduled today</div>
        )}
        {items.map(({ event, status }, i) => (
          <div
            key={`${event.start}-${i}`}
            data-status={i === nextIndex ? 'next' : status}
            className={`relative flex items-baseline gap-3 overflow-hidden rounded-xl border-l-4 px-4 py-3 text-2xl backdrop-blur-sm ${
              CARD_STYLE[i === nextIndex ? 'next' : status]
            }`}
          >
            {showTime && (
              <span className="w-24 shrink-0 tabular-nums font-semibold">
                {hhmm(event.start)}
                {showEndTime && event.end ? `–${hhmm(event.end)}` : ''}
              </span>
            )}
            <span className="flex-1">{event.summary}</span>
            {status === 'now' && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-green-400"
                style={{ width: `${progress(event, now)}%` }}
              />
            )}
          </div>
        ))}
      </div>
    </VerticalScroll>
  );
}
