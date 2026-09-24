import { describe, it, expect, vi, afterEach } from 'vitest';
import InfoStatusService from './info-status-service';
import Keyholder from './entities/keyholder';
import RoomStatus from './entities/room-status';

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

describe('InfoStatusService.getBeerTime', () => {
  const stored = (beerTime: string | null, updatedAt: Date): InfoStatusService => {
    const service = new InfoStatusService();
    vi.spyOn(service, 'getRoomStatusEntity').mockResolvedValue(
      Object.assign(new RoomStatus(), { id: 1, open: true, beerTime, updatedAt }),
    );
    return service;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the stored beer time for state set today', async () => {
    const service = stored('16:30', new Date());
    await expect(service.getBeerTime()).resolves.toEqual({ beerTime: '16:30' });
  });

  it('returns null when no beer time is set', async () => {
    const service = stored(null, new Date());
    await expect(service.getBeerTime()).resolves.toEqual({ beerTime: null });
  });

  it('returns null for state left over from an earlier logical day', async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const service = stored('16:30', twoDaysAgo);
    await expect(service.getBeerTime()).resolves.toEqual({ beerTime: null });
  });
});

describe('InfoStatusService.updateKeyholder', () => {
  const stored = (displayName: string | null): Keyholder => {
    const keyholder = Object.assign(new Keyholder(), {
      id: 1,
      name: 'Jan Jansen',
      displayName,
      photoUrl: null,
      isCandidateBoard: false,
    });
    vi.spyOn(Keyholder, 'findOne').mockResolvedValue(keyholder);
    vi.spyOn(keyholder, 'save').mockResolvedValue(keyholder);
    return keyholder;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lets an admin change the display name', async () => {
    const keyholder = stored(null);
    await new InfoStatusService().updateKeyholder(1, { displayName: 'JJ' }, true);
    expect(keyholder.displayName).toBe('JJ');
  });

  it('refuses a display name change from a non-admin', async () => {
    const keyholder = stored('Jan');
    await expect(
      new InfoStatusService().updateKeyholder(1, { displayName: 'JJ' }, false),
    ).rejects.toMatchObject({ status: 403 });
    expect(keyholder.displayName).toBe('Jan');
    expect(keyholder.save).not.toHaveBeenCalled();
  });

  it('refuses clearing the display name from a non-admin', async () => {
    stored('Jan');
    await expect(
      new InfoStatusService().updateKeyholder(1, { displayName: '' }, false),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('lets a non-admin change the photo and candidate flag with the name unchanged', async () => {
    const keyholder = stored('Jan');
    await new InfoStatusService().updateKeyholder(
      1,
      { displayName: ' Jan ', photoUrl: 'https://x/y.png', isCandidateBoard: true },
      false,
    );
    expect(keyholder.displayName).toBe('Jan');
    expect(keyholder.photoUrl).toBe('https://x/y.png');
    expect(keyholder.isCandidateBoard).toBe(true);
  });
});
