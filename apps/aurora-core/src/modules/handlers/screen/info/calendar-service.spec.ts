import { describe, it, expect } from 'vitest';
import CalendarService from './calendar-service';

const ical = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Lunch lecture
DTSTART:20260707T120000
DTEND:20260707T130000
END:VEVENT
BEGIN:VEVENT
SUMMARY:Eten
DTSTART:20260707T180000
END:VEVENT
BEGIN:VEVENT
SUMMARY:Tomorrow
DTSTART:20260708T120000
END:VEVENT
END:VCALENDAR`;

describe('CalendarService.parseToday', () => {
  it('returns todays non-excluded events sorted by start', () => {
    const now = new Date(2026, 6, 7, 9, 0, 0);
    const events = CalendarService.parseToday(ical, now);
    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('Lunch lecture');
  });

  it('excludes events on other days', () => {
    const now = new Date(2026, 6, 8, 9, 0, 0);
    const events = CalendarService.parseToday(ical, now);
    expect(events.map((e) => e.summary)).toEqual(['Tomorrow']);
  });
});

describe('CalendarService.parseDate', () => {
  it('parses all-day dates', () => {
    const date = CalendarService.parseDate('20260707');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(7);
  });

  it('parses UTC datetimes', () => {
    const date = CalendarService.parseDate('20260707T120000Z');
    expect(date.toISOString()).toBe('2026-07-07T12:00:00.000Z');
  });
});

describe('CalendarService.parseDate with a TZID', () => {
  it('reads a timestamp as wall-clock time in the named zone', () => {
    // 23:55 in Amsterdam in January is 22:55 UTC.
    const date = CalendarService.parseDate('20260101T235500', 'Europe/Amsterdam');
    expect(date.toISOString()).toBe('2026-01-01T22:55:00.000Z');
  });

  it('follows the zone across a DST change', () => {
    // Same wall clock in July, when Amsterdam is two hours ahead.
    const date = CalendarService.parseDate('20260701T235500', 'Europe/Amsterdam');
    expect(date.toISOString()).toBe('2026-07-01T21:55:00.000Z');
  });

  it('keeps honouring an explicit Z over the parameter', () => {
    const date = CalendarService.parseDate('20260101T235500Z', 'Europe/Amsterdam');
    expect(date.toISOString()).toBe('2026-01-01T23:55:00.000Z');
  });

  it('leaves an all-day date on its own day', () => {
    const date = CalendarService.parseDate('20260101', 'Europe/Amsterdam');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });

  it('falls back to floating time for a zone the runtime does not know', () => {
    const date = CalendarService.parseDate('20260101T235500', 'Mars/Olympus_Mons');
    expect(date.getHours()).toBe(23);
    expect(date.getMinutes()).toBe(55);
  });
});

describe('CalendarService.timeZoneOf', () => {
  it('finds the zone among the other parameters', () => {
    expect(CalendarService.timeZoneOf(['VALUE=DATE-TIME', 'TZID=Europe/Amsterdam'])).toBe(
      'Europe/Amsterdam',
    );
  });

  it('unquotes a quoted zone', () => {
    expect(CalendarService.timeZoneOf(['TZID="Europe/Amsterdam"'])).toBe('Europe/Amsterdam');
  });

  it('returns nothing when the property carries no zone', () => {
    expect(CalendarService.timeZoneOf(['VALUE=DATE'])).toBeUndefined();
  });
});

describe('CalendarService.parse with zoned events', () => {
  it('converts each event with its own zone', () => {
    const feed = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Amsterdam evening
DTSTART;TZID=Europe/Amsterdam:20260101T235500
DTEND;TZID=Europe/Amsterdam:20260102T003000
END:VEVENT
END:VCALENDAR`;
    const [event] = CalendarService.parse(feed);
    expect(event.start).toBe('2026-01-01T22:55:00.000Z');
    expect(event.end).toBe('2026-01-01T23:30:00.000Z');
  });
});
