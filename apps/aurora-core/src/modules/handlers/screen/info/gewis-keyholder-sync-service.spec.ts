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

/** A local row without touching the database, matching `remote` by default. */
const local = (
  id: number,
  name: string,
  memberId: number | null = null,
  fields: Partial<Keyholder> = {},
): Keyholder =>
  ({
    id,
    name,
    memberId,
    photoUrl: null,
    isBoard: false,
    isKeyholder: true,
    isCandidateBoard: false,
    ...fields,
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
    // The manual row carries a backoffice-set photo; recreating would lose it.
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

  it('leaves a row that already matches out of the plan entirely', () => {
    const row = local(1, 'Jane Doe', 1234);
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Doe')], [row]);
    expect(plan.create).toHaveLength(0);
    expect(plan.update).toHaveLength(0);
    // Still matched, or it would be removed as unaccounted for.
    expect(plan.remove).toHaveLength(0);
  });

  it('updates a row whose flags drifted from the API', () => {
    const row = local(1, 'Jane Doe', 1234, { isBoard: true });
    const plan = GewisKeyholderSyncService.plan([remote(1234, 'Jane Doe')], [row]);
    expect(plan.update.map((u) => u.local)).toEqual([row]);
  });

  it('updates a candidate board that has been installed as the board', () => {
    const row = local(1, 'Jane Doe', 1234, { isBoard: true, isCandidateBoard: true });
    const plan = GewisKeyholderSyncService.plan(
      [remote(1234, 'Jane Doe', { isBoard: true })],
      [row],
    );
    expect(plan.update.map((u) => u.local)).toEqual([row]);
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

describe('GewisKeyholderSyncService.candidateBoardAfterSync', () => {
  it('clears the flag once the candidate board is installed as the board', () => {
    expect(GewisKeyholderSyncService.candidateBoardAfterSync(true, true)).toBe(false);
  });

  it('leaves the backoffice value alone for everyone else', () => {
    expect(GewisKeyholderSyncService.candidateBoardAfterSync(true, false)).toBe(true);
    expect(GewisKeyholderSyncService.candidateBoardAfterSync(false, false)).toBe(false);
  });

  it('does not set the flag for a board member who never had it', () => {
    expect(GewisKeyholderSyncService.candidateBoardAfterSync(false, true)).toBe(false);
  });
});
