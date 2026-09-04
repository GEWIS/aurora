import { describe, it, expect } from 'vitest';
import InfoStatusService from './info-status-service';

/** Local time, so the tests read the same way the 06:00 boundary is defined. */
const at = (day: number, hour: number, minute = 0): Date =>
  new Date(2026, 8, day, hour, minute, 0, 0);

describe('InfoStatusService.isStale', () => {
  it('keeps state set earlier on the same logical day', () => {
    expect(InfoStatusService.isStale(at(2, 8), at(2, 23))).toBe(false);
  });

  it('keeps state set after midnight but before the 06:00 boundary', () => {
    // The logical day runs 06:00 → 06:00, so late-night activity still counts
    // as the previous day.
    expect(InfoStatusService.isStale(at(2, 22), at(3, 2))).toBe(false);
  });

  it('drops state once the reset boundary has passed', () => {
    expect(InfoStatusService.isStale(at(2, 22), at(3, 6))).toBe(true);
    expect(InfoStatusService.isStale(at(2, 22), at(3, 9))).toBe(true);
  });

  it('treats state written exactly on the boundary as current', () => {
    expect(InfoStatusService.isStale(at(3, 6), at(3, 9))).toBe(false);
  });

  it('treats a row that has never been persisted as current', () => {
    // getRoomStatusEntity hands back an unsaved default row, which has no
    // updatedAt yet.
    expect(InfoStatusService.isStale(undefined as unknown as Date, at(3, 9))).toBe(false);
  });

  it('drops state that is days old', () => {
    expect(InfoStatusService.isStale(at(1, 12), at(4, 12))).toBe(true);
  });
});
