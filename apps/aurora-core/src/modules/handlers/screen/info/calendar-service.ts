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
      const key = rawKey.split(';')[0];

      if (key === 'SUMMARY') current.summary = value.trim();
      else if (key === 'DTSTART') current.start = CalendarService.parseDate(value).toISOString();
      else if (key === 'DTEND') current.end = CalendarService.parseDate(value).toISOString();
    });

    return events;
  }

  /**
   * Parse an iCal date, handling both `YYYYMMDD` (all-day) and
   * `YYYYMMDDTHHMMSS[Z]` forms.
   */
  public static parseDate(value: string): Date {
    const trimmed = value.trim();
    const match = trimmed.match(
      /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/,
    );
    if (!match) return new Date(trimmed);

    const [, y, mo, d, h = '0', mi = '0', s = '0', z] = match;
    if (z) {
      return new Date(
        Date.UTC(+y, +mo - 1, +d, +h, +mi, +s),
      );
    }
    return new Date(+y, +mo - 1, +d, +h, +mi, +s);
  }
}
