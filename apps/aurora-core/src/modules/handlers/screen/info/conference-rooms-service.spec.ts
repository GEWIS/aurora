import { describe, it, expect } from 'vitest';
import ConferenceRoomsService from './conference-rooms-service';

describe('ConferenceRoomsService', () => {
  it('summarises the number of available rooms', () => {
    const rooms = [
      { id: 1, number: '1', available: true, busy: [] },
      { id: 2, number: '2', available: true, busy: [] },
      { id: 3, number: '3', available: false, busy: [] },
    ];
    expect(ConferenceRoomsService.summarize(rooms)).toBe('2 rooms available');
    expect(ConferenceRoomsService.summarize(rooms.slice(2))).toBe('No rooms available');
  });

  it('marks a room unavailable while a busy interval covers now', () => {
    const now = new Date('2026-07-08T11:00:00');
    const busy = [{ start: '2026-07-08T10:30:00', end: '2026-07-08T11:30:00' }];
    expect(ConferenceRoomsService.isAvailable(busy, now)).toBe(false);
    expect(ConferenceRoomsService.isAvailable([], now)).toBe(true);
  });

  it("extracts today's busy intervals from an iCal feed", () => {
    const now = new Date('2026-07-08T09:00:00');
    const ical = [
      'BEGIN:VEVENT',
      'SUMMARY:Meeting',
      'DTSTART:20260708T100000',
      'DTEND:20260708T110000',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:Tomorrow',
      'DTSTART:20260709T100000',
      'DTEND:20260709T110000',
      'END:VEVENT',
    ].join('\n');
    const busy = ConferenceRoomsService.busyToday(ical, now);
    expect(busy).toHaveLength(1);
  });

  it('keeps a booking that started yesterday and is still running', () => {
    const ical = [
      'BEGIN:VEVENT',
      'SUMMARY:Long night',
      'DTSTART:20260707T230000',
      'DTEND:20260708T013000',
      'END:VEVENT',
    ].join('\n');
    const now = new Date(2026, 6, 8, 0, 30, 0);
    const busy = ConferenceRoomsService.busyToday(ical, now);
    expect(busy).toHaveLength(1);
    expect(ConferenceRoomsService.isAvailable(busy, now)).toBe(false);
  });

  it('drops a booking that ended before today', () => {
    const ical = [
      'BEGIN:VEVENT',
      'SUMMARY:Yesterday',
      'DTSTART:20260707T100000',
      'DTEND:20260707T110000',
      'END:VEVENT',
    ].join('\n');
    const busy = ConferenceRoomsService.busyToday(ical, new Date(2026, 6, 8, 9, 0, 0));
    expect(busy).toHaveLength(0);
  });

  it('keeps an event with no end on the day it starts', () => {
    const ical = ['BEGIN:VEVENT', 'SUMMARY:Point', 'DTSTART:20260708T100000', 'END:VEVENT'].join(
      '\n',
    );
    const busy = ConferenceRoomsService.busyToday(ical, new Date(2026, 6, 8, 9, 0, 0));
    expect(busy).toHaveLength(1);
  });
});
