import { describe, it, expect } from 'vitest';
import RainRadarService from './rain-radar-service';

describe('RainRadarService.valueToMmh', () => {
  it('treats 0 and tiny values as dry', () => {
    expect(RainRadarService.valueToMmh(0)).toBe(0);
    expect(RainRadarService.valueToMmh(10)).toBe(0);
  });

  it('maps value 109 to ~1 mm/h', () => {
    expect(RainRadarService.valueToMmh(109)).toBeCloseTo(1, 5);
  });

  it('increases with the value', () => {
    expect(RainRadarService.valueToMmh(150)).toBeGreaterThan(RainRadarService.valueToMmh(120));
  });
});

describe('RainRadarService.parse', () => {
  const now = new Date('2026-07-08T14:58:00');

  it('parses raintext lines and flags no rain when all dry', () => {
    const body = '000|15:00\n000|15:05\n000|15:10';
    const result = RainRadarService.parse(body, now);
    expect(result.interval).toBe(300);
    expect(result.precip).toHaveLength(3);
    expect(result.noRainExpected).toBe(true);
  });

  it('detects expected rain', () => {
    const body = '000|15:00\n150|15:05\n000|15:10';
    const result = RainRadarService.parse(body, now);
    expect(result.noRainExpected).toBe(false);
  });

  it('anchors the start time to the first sample', () => {
    const result = RainRadarService.parse('000|15:00', now);
    expect(result.start).toBe(Math.floor(new Date('2026-07-08T15:00:00').getTime() / 1000));
  });

  it('handles an empty body', () => {
    const result = RainRadarService.parse('', now);
    expect(result.precip).toEqual([]);
    expect(result.noRainExpected).toBe(true);
  });
});
