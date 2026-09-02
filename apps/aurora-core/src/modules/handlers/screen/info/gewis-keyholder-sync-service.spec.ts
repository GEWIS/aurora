import { describe, it, expect } from 'vitest';
import GewisKeyholderSyncService, { GewisKeyholder } from './gewis-keyholder-sync-service';
import Keyholder from './entities/keyholder';

const remote = (
  lidnr: number,
  name: string,
  flags: Partial<GewisKeyholder> = {},
): GewisKeyholder => ({
  lidnr,
  name,
  isBoard: false,
  isKeyholder: true,
  ...flags,
});

/** A local row without touching the database. */
const local = (
  id: number,
  name: string,
  memberId: number | null = null,
  syncedName: string | null = memberId ? name : null,
): Keyholder =>
  ({
    id,
    name,
    memberId,
    syncedName,
    usernames: [],
    photoUrl: null,
    isCandidateBoard: false,
  }) as unknown as Keyholder;

describe('GewisKeyholderSyncService.guard', () => {
  it('accepts a member with a number and a name', () => {
    expect(GewisKeyholderSyncService.guard(remote(1234, 'Jane Doe'))).toBe(true);
  });

  it('rejects entries that cannot be represented locally', () => {
    expect(GewisKeyholderSyncService.guard(remote(0, 'Jane Doe'))).toBe(false);
    expect(GewisKeyholderSyncService.guard(remote(-1, 'Jane Doe'))).toBe(false);
    expect(GewisKeyholderSyncService.guard(remote(1234, ''))).toBe(false);
  });
});

describe('GewisKeyholderSyncService.mergeFlags', () => {
  it('returns the first sighting unchanged', () => {
    const person = remote(1234, 'Jane Doe');
    expect(GewisKeyholderSyncService.mergeFlags(undefined, person)).toEqual(person);
  });

  it('ORs the flags of a member listed by both endpoints', () => {
    const asKeyholder = remote(1234, 'Jane Doe', { isKeyholder: true, isBoard: false });
    const asBoard = remote(1234, 'Jane Doe', { isKeyholder: false, isBoard: true });
    const merged = GewisKeyholderSyncService.mergeFlags(asKeyholder, asBoard);
    expect(merged).toMatchObject({ isKeyholder: true, isBoard: true });
  });
});

describe('GewisKeyholderSyncService.plan', () => {
  it('creates rows for members the registry does not have', () => {
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Doe')], []);
    expect(plan.create).toHaveLength(1);
    expect(plan.update).toHaveLength(0);
    expect(plan.remove).toHaveLength(0);
  });

  it('matches on membership number, so an upstream rename updates the row', () => {
    const row = local(1, 'Jane Doe', 1234);
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Smith')], [row]);
    expect(plan.create).toHaveLength(0);
    expect(plan.update).toEqual([{ local: row, remote: remote(1234, 'Jane Smith') }]);
    expect(plan.remove).toHaveLength(0);
  });

  it('adopts a manually added row with the same name rather than recreating it', () => {
    // The manual row carries a backoffice-set photo and login names; recreating
    // would lose both.
    const manual = local(7, 'Jane Doe');
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Doe')], [manual]);
    expect(plan.create).toHaveLength(0);
    expect(plan.update.map((u) => u.local)).toEqual([manual]);
    expect(plan.remove).toHaveLength(0);
  });

  it('matches names case- and whitespace-insensitively', () => {
    const manual = local(7, '  jane doe ');
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Doe')], [manual]);
    expect(plan.update.map((u) => u.local)).toEqual([manual]);
  });

  it('removes rows the API no longer accounts for', () => {
    const gone = local(2, 'John Gone', 999);
    const stays = local(1, 'Jane Doe', 1234);
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Doe')], [stays, gone]);
    expect(plan.remove).toEqual([gone]);
  });

  it('removes manual rows that match nobody, keeping the API authoritative', () => {
    const manual = local(7, 'Someone Else');
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Doe')], [manual]);
    expect(plan.create).toHaveLength(1);
    expect(plan.remove).toEqual([manual]);
  });
});

describe('GewisKeyholderSyncService.nameIsOverridden', () => {
  it('is false for a row whose name still matches the API', () => {
    expect(
      GewisKeyholderSyncService.nameIsOverridden({ name: 'Jane Doe', syncedName: 'Jane Doe' }),
    ).toBe(false);
  });

  it('is true once the name has been edited in the backoffice', () => {
    expect(
      GewisKeyholderSyncService.nameIsOverridden({ name: 'Jane', syncedName: 'Jane Doe' }),
    ).toBe(true);
  });

  it('is false for a row that never came from the API', () => {
    expect(GewisKeyholderSyncService.nameIsOverridden({ name: 'Jane', syncedName: null })).toBe(
      false,
    );
  });
});
