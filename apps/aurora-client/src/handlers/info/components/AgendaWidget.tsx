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

export default function AgendaWidget({ events: initialEvents, settings }: Props) {
  const showTime = sBool(settings, 'showTime', true);
  const showEndTime = sBool(settings, 'showEndTime', false);
  const calendarUrl = sStr(settings, 'calendarUrl', '');

  // Self-fetch today's events from the configured calendar (per-widget setting).
  // Without one the widget follows the screen-wide agenda the core broadcasts.
  const events = useCachedResource(
    calendarUrl ? `agenda:${calendarUrl}` : null,
    async () => (await getInfoAgenda({ query: { url: calendarUrl } })).data,
    5 * 60_000,
    initialEvents,
  );

  return (
    <VerticalScroll visible items={events.length} scrollEmptySpace>
      <div className="flex flex-col gap-2 font-raleway text-white">
        {events.length === 0 && (
          <div className="text-white/60 text-2xl">Nothing scheduled today</div>
        )}
        {events.map((event, i) => (
          <div key={`${event.start}-${i}`} className="flex items-baseline gap-3 text-2xl">
            {showTime && (
              <span className="w-24 shrink-0 tabular-nums font-semibold">
                {hhmm(event.start)}
                {showEndTime && event.end ? `–${hhmm(event.end)}` : ''}
              </span>
            )}
            <span className="flex-1">{event.summary}</span>
          </div>
        ))}
      </div>
    </VerticalScroll>
  );
}
