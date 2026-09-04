import { describe, it, expect } from 'vitest';
import {
  formatHhMmSs,
  formatMmSs,
  remainingHoursMinutes,
  remainingInWords,
  remainingMinutes,
  remainingSeconds,
} from './countdown';

describe('remainingSeconds', () => {
  it('rounds a partial second up, so it agrees with a clock showing whole seconds', () => {
    // The reported bug: at 15:59:55.4 with beer time at 16:00:00 the clock reads
    // :55, so five whole seconds remain — flooring 4.6 showed four.
    expect(remainingSeconds(4600)).toBe(5);
    expect(remainingSeconds(4001)).toBe(5);
    expect(remainingSeconds(5000)).toBe(5);
  });

  it('reaches zero only when the target is reached', () => {
    expect(remainingSeconds(1)).toBe(1);
    expect(remainingSeconds(0)).toBe(0);
  });

  it('treats a negative difference as time since the target', () => {
    expect(remainingSeconds(-4600)).toBe(5);
  });
});

describe('formatMmSs', () => {
  it('shows the seconds a clock at :55 implies', () => {
    expect(formatMmSs(4600)).toBe('00:05');
  });

  it('rounds the total up once, so the parts always carry', () => {
    // 59.4s must not become "00:60", and must not borrow into the minutes.
    expect(formatMmSs(59_400)).toBe('01:00');
    expect(formatMmSs(60_000)).toBe('01:00');
    expect(formatMmSs(60_001)).toBe('01:01');
  });

  it('pads both parts', () => {
    expect(formatMmSs(0)).toBe('00:00');
    expect(formatMmSs(9000)).toBe('00:09');
    expect(formatMmSs(600_000)).toBe('10:00');
  });
});

describe('formatHhMmSs', () => {
  it('rounds the total up once rather than each part', () => {
    // Rounding each part independently would turn 4.6s into "01:01:05".
    expect(formatHhMmSs(4600)).toBe('00:00:05');
    expect(formatHhMmSs(3_599_400)).toBe('01:00:00');
    expect(formatHhMmSs(3_600_000)).toBe('01:00:00');
  });

  it('formats a long countdown', () => {
    expect(formatHhMmSs(36 * 3_600_000 + 5 * 60_000 + 7000)).toBe('36:05:07');
  });
});

describe('remainingMinutes / remainingHoursMinutes', () => {
  it('rounds a partial minute up', () => {
    expect(remainingMinutes(30_000)).toBe(1);
    expect(remainingMinutes(60_000)).toBe(1);
    expect(remainingMinutes(60_001)).toBe(2);
  });

  it('splits without letting the minutes reach 60', () => {
    expect(remainingHoursMinutes(3_599_400)).toEqual({ hours: 1, minutes: 0 });
    expect(remainingHoursMinutes(3 * 3_600_000 + 4 * 60_000 + 55_000)).toEqual({
      hours: 3,
      minutes: 5,
    });
    expect(remainingHoursMinutes(0)).toEqual({ hours: 0, minutes: 0 });
  });
});

describe('remainingInWords', () => {
  const minutes = (n: number) => n * 60_000;

  it('reads both parts when both are non-zero', () => {
    expect(remainingInWords(minutes(152))).toBe('2 hours and 32 minutes');
  });

  it('drops a zero part rather than saying "0 minutes"', () => {
    expect(remainingInWords(minutes(120))).toBe('2 hours');
    expect(remainingInWords(minutes(45))).toBe('45 minutes');
  });

  it('uses the singular for exactly one', () => {
    expect(remainingInWords(minutes(60))).toBe('1 hour');
    expect(remainingInWords(minutes(1))).toBe('1 minute');
    expect(remainingInWords(minutes(61))).toBe('1 hour and 1 minute');
  });

  it('says "less than a minute" once the parts would both be gone', () => {
    expect(remainingInWords(0)).toBe('less than a minute');
  });

  it('rounds up, so a partial minute still counts', () => {
    // 90s remaining is inside the second minute, so it reads as two.
    expect(remainingInWords(90_000)).toBe('2 minutes');
  });
});
