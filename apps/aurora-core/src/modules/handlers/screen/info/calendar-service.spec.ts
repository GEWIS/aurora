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
