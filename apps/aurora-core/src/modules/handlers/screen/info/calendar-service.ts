import axios from 'axios';

export interface AgendaEvent {
  summary: string;
  start: string;
  end: string | null;
}

const EXCLUDED_SUMMARIES = ['eten'];

/** BYDAY weekday codes, indexed like `Date#getUTCDay`. */
const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Upper bound on the recurrence periods walked per rule. An unbounded daily
 * rule starting in the early 2000s needs under ten thousand; the cap only stops
 * a malformed feed from spinning forever.
 */
const MAX_PERIODS = 20_000;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A parsed RRULE, limited to the parts this parser supports. */
export interface RecurrenceRule {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  count?: number;
  /** UNTIL as an instant, inclusive. */
  until?: number;
  byDay: { ordinal: number | null; weekday: number }[];
  byMonthDay: number[];
  /** 1-based months, as BYMONTH writes them. */
  byMonth: number[];
  weekStart: number;
}

/** A VEVENT as read from the feed, before recurrence expansion. */
interface RawEvent {
  summary: string;
  uid: string;
  start: string;
  end: string | null;
  /** The raw DTSTART value and zone, needed to expand occurrences. */
  startValue: string;
  startZone?: string;
  rrule?: string;
  /** Occurrence instants the rule must skip. */
  exdates: number[];
  /** The occurrence this VEVENT replaces, as an instant. */
  recurrenceId?: number;
}

/** A calendar day in wall-clock terms. */
interface DayParts {
  year: number;
  /** 0-based, as `Date` counts months. */
  month: number;
  day: number;
}

/** The wall-clock pieces of a DTSTART value. */
interface StartParts extends DayParts {
  /** The `THHMMSS[Z]` tail, or '' for an all-day event. */
  time: string;
  /** Time of day in ms, used to order occurrences without a zone lookup. */
  offsetMs: number;
}

const pad = (value: number): string => value.toString().padStart(2, '0');

const formatDay = (day: DayParts): string => `${day.year}${pad(day.month + 1)}${pad(day.day)}`;

const dayKey = (day: DayParts): number => Date.UTC(day.year, day.month, day.day);

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
   *
   * Recurring events are expanded onto the requested day rather than matched on
   * their DTSTART: a weekly borrel carries the date of its first occurrence,
   * which may be years back, so filtering on DTSTART alone hides every repeat.
   * EXDATEs drop cancelled instances, and a VEVENT carrying a RECURRENCE-ID
   * replaces the occurrence it names — including when it was moved to another
   * day, which is why an override is matched on the occurrence it overrides and
   * placed on the day it actually falls.
   */
  public static parseToday(ical: string, now: Date): AgendaEvent[] {
    const raw = CalendarService.parseRaw(ical);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const onDay = (iso: string): boolean => {
      const instant = Date.parse(iso);
      return instant >= dayStart && instant < dayEnd;
    };

    const overrides = new Set<string>();
    raw.forEach((event) => {
      if (event.recurrenceId !== undefined && event.uid) {
        overrides.add(`${event.uid}|${event.recurrenceId}`);
      }
    });

    const today: AgendaEvent[] = [];
    raw.forEach((event) => {
      if (event.recurrenceId !== undefined || !event.rrule) {
        if (onDay(event.start)) {
          today.push({ summary: event.summary, start: event.start, end: event.end });
        }
        return;
      }

      const durationMs = event.end ? Date.parse(event.end) - Date.parse(event.start) : null;
      CalendarService.occurrencesOn(event, dayStart, dayEnd).forEach((instant) => {
        if (event.exdates.includes(instant)) return;
        if (event.uid && overrides.has(`${event.uid}|${instant}`)) return;
        today.push({
          summary: event.summary,
          start: new Date(instant).toISOString(),
          end: durationMs === null ? null : new Date(instant + durationMs).toISOString(),
        });
      });
    });

    return today
      .filter((event) => !EXCLUDED_SUMMARIES.includes(event.summary.toLowerCase()))
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  }

  /** Every VEVENT in the feed, one entry per stored event (recurrences unexpanded). */
  public static parse(ical: string): AgendaEvent[] {
    return CalendarService.parseRaw(ical).map(({ summary, start, end }) => ({
      summary,
      start,
      end,
    }));
  }

  private static parseRaw(ical: string): RawEvent[] {
    const events: RawEvent[] = [];
    // Unfold folded lines (continuation lines start with a space or tab).
    const lines = ical.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);

    let current: Partial<RawEvent> | null = null;
    lines.forEach((line) => {
      if (line.startsWith('BEGIN:VEVENT')) {
        current = { exdates: [] };
        return;
      }
      if (line.startsWith('END:VEVENT')) {
        if (current && current.summary && current.start) {
          events.push({
            summary: current.summary,
            uid: current.uid ?? '',
            start: current.start,
            end: current.end ?? null,
            startValue: current.startValue ?? '',
            startZone: current.startZone,
            rrule: current.rrule,
            exdates: current.exdates ?? [],
            recurrenceId: current.recurrenceId,
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
      else if (key === 'UID') current.uid = value.trim();
      else if (key === 'RRULE') current.rrule = value.trim();
      else if (key === 'DTSTART') {
        current.startValue = value.trim();
        current.startZone = zone;
        current.start = CalendarService.parseDate(value, zone).toISOString();
      } else if (key === 'DTEND') {
        current.end = CalendarService.parseDate(value, zone).toISOString();
      } else if (key === 'RECURRENCE-ID') {
        current.recurrenceId = CalendarService.parseDate(value, zone).getTime();
      } else if (key === 'EXDATE') {
        // A single EXDATE may carry a comma-separated list of instants.
        value
          .split(',')
          .forEach((v) => current?.exdates?.push(CalendarService.parseDate(v, zone).getTime()));
      }
    });

    return events;
  }

  /**
   * The occurrence instants of a recurring event that fall on `[dayStart,
   * dayEnd)`.
   *
   * Occurrences are walked from DTSTART in wall-clock terms, because a rule
   * keeps its local time of day across a DST change: the Thursday borrel is at
   * 16:30 in Amsterdam in both January and July, which stepping by a fixed
   * number of milliseconds would not preserve. Converting every candidate to a
   * real instant would mean an `Intl` lookup per occurrence, so each candidate
   * is first ordered by a zone-free key — within a day of the true instant,
   * enough to count occurrences and to know when to stop — and only candidates
   * near the target day are converted for real.
   */
  private static occurrencesOn(event: RawEvent, dayStart: number, dayEnd: number): number[] {
    const rule = CalendarService.parseRule(event.rrule ?? '');
    const parts = CalendarService.startParts(event.startValue);
    if (!rule || !parts) return [];

    const firstKey = dayKey(parts) + parts.offsetMs;
    const cursor = CalendarService.firstPeriod(rule, parts);
    const found: number[] = [];
    let seen = 0;

    for (let period = 0; period < MAX_PERIODS; period += 1) {
      const days = CalendarService.periodDays(rule, cursor, parts);
      for (let i = 0; i < days.length; i += 1) {
        const key = dayKey(days[i]) + parts.offsetMs;
        if (key < firstKey) continue;
        seen += 1;
        if (rule.count !== undefined && seen > rule.count) return found;
        if (rule.until !== undefined && key > rule.until + DAY_MS) return found;
        if (key >= dayEnd + DAY_MS) return found;
        if (key <= dayStart - DAY_MS) continue;

        const instant = CalendarService.parseDate(
          formatDay(days[i]) + parts.time,
          event.startZone,
        ).getTime();
        if (rule.until !== undefined && instant > rule.until) return found;
        if (instant >= dayEnd) return found;
        if (instant >= dayStart) found.push(instant);
      }
      CalendarService.advance(rule, cursor);
    }

    return found;
  }

  /** Parse an RRULE, or null when it names a frequency this parser cannot expand. */
  public static parseRule(rrule: string): RecurrenceRule | null {
    const parts = new Map<string, string>();
    rrule.split(';').forEach((piece) => {
      const [key, value] = piece.split('=');
      if (key && value !== undefined) parts.set(key.toUpperCase(), value);
    });

    const freq = parts.get('FREQ')?.toUpperCase();
    if (freq !== 'DAILY' && freq !== 'WEEKLY' && freq !== 'MONTHLY' && freq !== 'YEARLY') {
      return null;
    }

    const numbers = (key: string): number[] =>
      (parts.get(key) ?? '')
        .split(',')
        .map((value) => parseInt(value, 10))
        .filter((value) => !Number.isNaN(value));

    const interval = parseInt(parts.get('INTERVAL') ?? '1', 10);
    const count = parts.get('COUNT');
    const until = parts.get('UNTIL');
    const weekStart = WEEKDAYS.indexOf(parts.get('WKST')?.toUpperCase() ?? 'MO');

    return {
      freq,
      interval: Number.isNaN(interval) || interval < 1 ? 1 : interval,
      count: count ? parseInt(count, 10) : undefined,
      until: until ? CalendarService.parseDate(until).getTime() : undefined,
      byDay: CalendarService.parseByDay(parts.get('BYDAY') ?? ''),
      byMonthDay: numbers('BYMONTHDAY'),
      byMonth: numbers('BYMONTH'),
      weekStart: weekStart < 0 ? 1 : weekStart,
    };
  }

  /** BYDAY entries, each an optional ordinal and a weekday (`TH`, `3TH`, `-1SU`). */
  private static parseByDay(byDay: string): { ordinal: number | null; weekday: number }[] {
    const result: { ordinal: number | null; weekday: number }[] = [];
    byDay
      .split(',')
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean)
      .forEach((token) => {
        const match = token.match(/^([+-]?\d+)?([A-Z]{2})$/);
        if (!match) return;
        const weekday = WEEKDAYS.indexOf(match[2]);
        if (weekday < 0) return;
        result.push({ ordinal: match[1] ? parseInt(match[1], 10) : null, weekday });
      });
    return result;
  }

  /** The wall-clock date/time pieces of a DTSTART value. */
  private static startParts(value: string): StartParts | null {
    const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
    if (!match) return null;

    const [, y, mo, d, h, mi, s, z] = match;
    return {
      year: +y,
      month: +mo - 1,
      day: +d,
      time: h === undefined ? '' : `T${h}${mi}${s}${z ?? ''}`,
      offsetMs: h === undefined ? 0 : ((+h * 60 + +mi) * 60 + +s) * 1000,
    };
  }

  /**
   * A UTC-anchored cursor on the period containing DTSTART. Monthly and yearly
   * cursors sit on the first of the month so stepping cannot overflow a short
   * month; weekly cursors sit on the rule's week start.
   */
  private static firstPeriod(rule: RecurrenceRule, parts: StartParts): Date {
    const cursor = new Date(dayKey(parts));
    if (rule.freq === 'WEEKLY') {
      cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() - rule.weekStart + 7) % 7));
    } else if (rule.freq === 'MONTHLY') {
      cursor.setUTCDate(1);
    } else if (rule.freq === 'YEARLY') {
      cursor.setUTCDate(1);
      cursor.setUTCMonth(0);
    }
    return cursor;
  }

  private static advance(rule: RecurrenceRule, cursor: Date): void {
    if (rule.freq === 'DAILY') cursor.setUTCDate(cursor.getUTCDate() + rule.interval);
    else if (rule.freq === 'WEEKLY') cursor.setUTCDate(cursor.getUTCDate() + 7 * rule.interval);
    else if (rule.freq === 'MONTHLY') cursor.setUTCMonth(cursor.getUTCMonth() + rule.interval);
    else cursor.setUTCFullYear(cursor.getUTCFullYear() + rule.interval);
  }

  /** The candidate days inside the period at `cursor`, in ascending order. */
  private static periodDays(rule: RecurrenceRule, cursor: Date, parts: StartParts): DayParts[] {
    const year = cursor.getUTCFullYear();
    if (rule.freq === 'DAILY') {
      return [{ year, month: cursor.getUTCMonth(), day: cursor.getUTCDate() }];
    }

    if (rule.freq === 'WEEKLY') {
      const weekdays = rule.byDay.length
        ? rule.byDay.map((entry) => entry.weekday)
        : [new Date(dayKey(parts)).getUTCDay()];
      return weekdays
        .map((weekday) => {
          const day = new Date(cursor);
          day.setUTCDate(day.getUTCDate() + ((weekday - rule.weekStart + 7) % 7));
          return { year: day.getUTCFullYear(), month: day.getUTCMonth(), day: day.getUTCDate() };
        })
        .sort((a, b) => dayKey(a) - dayKey(b));
    }

    const months =
      rule.freq === 'YEARLY'
        ? rule.byMonth.length
          ? rule.byMonth.map((month) => month - 1)
          : [parts.month]
        : [cursor.getUTCMonth()];

    const days: DayParts[] = [];
    months.forEach((month) => days.push(...CalendarService.monthDays(rule, year, month, parts)));
    return days.sort((a, b) => dayKey(a) - dayKey(b));
  }

  /** The days BYMONTHDAY/BYDAY select inside one month, defaulting to DTSTART's. */
  private static monthDays(
    rule: RecurrenceRule,
    year: number,
    month: number,
    parts: StartParts,
  ): DayParts[] {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    if (rule.byMonthDay.length) {
      return rule.byMonthDay
        .map((day) => (day < 0 ? lastDay + 1 + day : day))
        .filter((day) => day >= 1 && day <= lastDay)
        .map((day) => ({ year, month, day }));
    }

    if (rule.byDay.length) {
      const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
      const days: DayParts[] = [];
      rule.byDay.forEach(({ ordinal, weekday }) => {
        const matches: number[] = [];
        for (let day = 1 + ((weekday - firstWeekday + 7) % 7); day <= lastDay; day += 7) {
          matches.push(day);
        }
        if (ordinal === null) {
          matches.forEach((day) => days.push({ year, month, day }));
          return;
        }
        const picked = ordinal > 0 ? matches[ordinal - 1] : matches[matches.length + ordinal];
        if (picked !== undefined) days.push({ year, month, day: picked });
      });
      return days;
    }

    return parts.day <= lastDay ? [{ year, month, day: parts.day }] : [];
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
