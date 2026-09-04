import axios from 'axios';

export interface AgendaEvent {
  summary: string;
  start: string;
  end: string | null;
}

const EXCLUDED_SUMMARIES = ['eten'];

/**
 * Fetches the GEWIS iCal feed and returns today's events. Uses a minimal,
 * dependency-free VEVENT parser (the feed is line-based).
 */
export default class CalendarService {
  public async getTodaysEvents(url?: string, now: Date = new Date()): Promise<AgendaEvent[]> {
    if (!url) return [];

    const { data } = await axios.get<string>(url, { responseType: 'text' });
    return CalendarService.parseToday(data, now);
  }

  /**
   * Pure parse + today-filter so it can be unit tested without a network call.
   */
  public static parseToday(ical: string, now: Date): AgendaEvent[] {
    return CalendarService.parse(ical)
      .filter((event) => !EXCLUDED_SUMMARIES.includes(event.summary.toLowerCase()))
      .filter((event) => CalendarService.isSameDay(new Date(event.start), now))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  private static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  public static parse(ical: string): AgendaEvent[] {
    const events: AgendaEvent[] = [];
    // Unfold folded lines (continuation lines start with a space or tab).
    const lines = ical.replace(/\r\n[ \t]/g, '').split(/\r?\n/);

    let current: Partial<AgendaEvent> | null = null;
    lines.forEach((line) => {
      if (line.startsWith('BEGIN:VEVENT')) {
        current = {};
        return;
      }
      if (line.startsWith('END:VEVENT')) {
        if (current && current.summary && current.start) {
          events.push({
            summary: current.summary,
            start: current.start,
            end: current.end ?? null,
          });
        }
        current = null;
        return;
      }
      if (!current) return;

      const [rawKey, ...rest] = line.split(':');
      const value = rest.join(':');
      const [key, ...params] = rawKey.split(';');
      const zone = CalendarService.timeZoneOf(params);

      if (key === 'SUMMARY') current.summary = value.trim();
      else if (key === 'DTSTART')
        current.start = CalendarService.parseDate(value, zone).toISOString();
      else if (key === 'DTEND') current.end = CalendarService.parseDate(value, zone).toISOString();
    });

    return events;
  }

  /** The IANA zone named by a property's `TZID` parameter, if it has one. */
  public static timeZoneOf(params: string[]): string | undefined {
    const tzid = params.find((p) => p.toUpperCase().startsWith('TZID='));
    if (!tzid) return undefined;
    // Quoted parameter values are legal: TZID="Europe/Amsterdam".
    return tzid.slice('TZID='.length).replace(/^"|"$/g, '') || undefined;
  }

  /**
   * Parse an iCal date, handling both `YYYYMMDD` (all-day) and
   * `YYYYMMDDTHHMMSS[Z]` forms.
   *
   * A trailing `Z` is UTC. Otherwise the timestamp is wall-clock time in
   * `timeZone`, which comes from the property's `TZID` parameter. Without one it
   * is a floating time, which iCal defines as local to whoever reads it — the
   * server, here. Ignoring a `TZID` would silently make every event in a feed
   * from another zone read as local: on a UTC container an Amsterdam feed lands
   * one or two hours late, enough to move an evening event to the wrong day.
   */
  public static parseDate(value: string, timeZone?: string): Date {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
    if (!match) return new Date(trimmed);

    const [, y, mo, d, h = '0', mi = '0', s = '0', z] = match;
    if (z) {
      return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
    }
    // An all-day date has no time to convert; it is the same day everywhere.
    if (timeZone && trimmed.includes('T')) {
      const zoned = CalendarService.fromZonedTime(+y, +mo - 1, +d, +h, +mi, +s, timeZone);
      if (zoned) return zoned;
    }
    return new Date(+y, +mo - 1, +d, +h, +mi, +s);
  }

  /**
   * The instant at which `timeZone` shows the given wall clock.
   *
   * Read the wall clock as if it were UTC, ask what offset the zone had at that
   * approximate instant, and subtract it. The offset is re-read at the corrected
   * instant because the first guess can land on the wrong side of a DST change;
   * one correction is enough, since offsets shift by at most a couple of hours.
   *
   * Returns null for a zone the runtime does not know, leaving the caller on its
   * floating-time fallback rather than inventing a time.
   */
  private static fromZonedTime(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timeZone: string,
  ): Date | null {
    const wallClock = Date.UTC(year, month, day, hour, minute, second);
    try {
      const guess = CalendarService.zoneOffset(wallClock, timeZone);
      const offset = CalendarService.zoneOffset(wallClock - guess, timeZone);
      return new Date(wallClock - offset);
    } catch {
      // Intl throws a RangeError on an unknown zone identifier.
      return null;
    }
  }

  /** How far ahead of UTC `timeZone` was at `timestamp`, in milliseconds. */
  private static zoneOffset(timestamp: number, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(new Date(timestamp));

    const field = (type: string): number => Number(parts.find((p) => p.type === type)?.value);
    // Some runtimes render midnight as hour 24 rather than 0.
    const hour = field('hour') % 24;
    const local = Date.UTC(
      field('year'),
      field('month') - 1,
      field('day'),
      hour,
      field('minute'),
      field('second'),
    );
    return local - timestamp;
  }
}
