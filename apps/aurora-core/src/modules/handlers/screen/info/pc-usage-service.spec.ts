import { describe, it, expect } from 'vitest';
import PcUsageService from './pc-usage-service';
import Keyholder from './entities/keyholder';
import { PcStatusType } from './entities/pc-status';

function keyholder(overrides: Partial<Keyholder>): Keyholder {
  return Object.assign(new Keyholder(), {
    name: 'Test',
    isBoard: false,
    isCandidateBoard: false,
    isKeyholder: false,
    photoUrl: null,
    memberId: null,
    ...overrides,
  });
}

describe('PcUsageService.deriveSymbol', () => {
  const keyholders = [
    keyholder({ name: 'Board', isBoard: true, memberId: 1 }),
    keyholder({ name: 'Candidate+Key', isCandidateBoard: true, isKeyholder: true, memberId: 2 }),
    keyholder({ name: 'Candidate', isCandidateBoard: true, memberId: 3 }),
    keyholder({ name: 'Key', isKeyholder: true, memberId: 4 }),
  ];

  it('prefers the board symbol', () => {
    expect(PcUsageService.deriveSymbol(1, keyholders)).toBe('★');
  });

  it('uses the candidate+keyholder symbol', () => {
    expect(PcUsageService.deriveSymbol(2, keyholders)).toBe('🍭');
  });

  it('uses the candidate symbol', () => {
    expect(PcUsageService.deriveSymbol(3, keyholders)).toBe('🍬');
  });

  it('uses the keyholder symbol', () => {
    expect(PcUsageService.deriveSymbol(4, keyholders)).toBe('🔑');
  });

  it('returns empty for a member the registry does not list', () => {
    expect(PcUsageService.deriveSymbol(999, keyholders)).toBe('');
  });

  it('returns empty for an account that belongs to no member', () => {
    expect(PcUsageService.deriveSymbol(null, keyholders)).toBe('');
  });

  it('does not match a manually added row, which has no membership number', () => {
    const manual = [keyholder({ name: 'Manual', isBoard: true, memberId: null })];
    expect(PcUsageService.deriveSymbol(null, manual)).toBe('');
  });
});

describe('PcUsageService.toSessionUser', () => {
  it('reads a member session', () => {
    expect(PcUsageService.toSessionUser({ pcId: '1', memberId: 1234, name: 'Jane Doe' })).toEqual([
      { memberId: 1234, name: 'Jane Doe' },
    ]);
  });

  it('keeps a named account that belongs to no member', () => {
    expect(PcUsageService.toSessionUser({ pcId: '1', name: 'join.gewis.nl' })).toEqual([
      { memberId: null, name: 'join.gewis.nl' },
    ]);
  });

  it('falls back to the membership number when no name was reported', () => {
    expect(PcUsageService.toSessionUser({ pcId: '1', memberId: 1234 })).toEqual([
      { memberId: 1234, name: 'Member 1234' },
    ]);
  });

  it('treats an empty report, and the legacy "-" sentinel, as nobody', () => {
    expect(PcUsageService.toSessionUser({ pcId: '1' })).toEqual([]);
    expect(PcUsageService.toSessionUser({ pcId: '1', name: '' })).toEqual([]);
    expect(PcUsageService.toSessionUser({ pcId: '1', name: '-' })).toEqual([]);
    expect(PcUsageService.toSessionUser({ pcId: '1', memberId: null, name: null })).toEqual([]);
  });
});

describe('PcUsageService.isPhysical', () => {
  it('accepts the ten seats in the room and nothing else', () => {
    expect(PcUsageService.isPhysical('1')).toBe(true);
    expect(PcUsageService.isPhysical('10')).toBe(true);
    expect(PcUsageService.isPhysical('0')).toBe(false);
    expect(PcUsageService.isPhysical('11')).toBe(false);
    expect(PcUsageService.isPhysical('vdesktop')).toBe(false);
    expect(PcUsageService.isPhysical('gewisvdesktop-03')).toBe(false);
  });
});

describe('PcUsageService.foldVirtual', () => {
  it('collapses the reported sessions into one PC with many users', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesktop', memberId: 1, name: 'Jane', remote: true },
      { pcId: 'vdesktop', memberId: 2, name: 'John', remote: true },
    ]);
    expect(folded.users).toEqual([
      { memberId: 1, name: 'Jane' },
      { memberId: 2, name: 'John' },
    ]);
    expect(folded.status).toBe(PcStatusType.REMOTE);
    expect(folded.remote).toBe(true);
  });

  it('de-duplicates a member with two sessions', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesktop', memberId: 1, name: 'Jane' },
      { pcId: 'vdesktop', memberId: 1, name: 'Jane' },
    ]);
    expect(folded.users).toEqual([{ memberId: 1, name: 'Jane' }]);
  });

  it('de-duplicates memberless accounts by name instead', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesktop', name: 'Guest' },
      { pcId: 'vdesktop', name: 'guest' },
    ]);
    expect(folded.users).toEqual([{ memberId: null, name: 'Guest' }]);
  });

  it('ignores sessions with nobody logged in', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesktop', name: null },
      { pcId: 'vdesktop', name: '' },
      { pcId: 'vdesktop', name: '-' },
      { pcId: 'vdesktop', memberId: 5, name: 'Jane' },
    ]);
    expect(folded.users).toEqual([{ memberId: 5, name: 'Jane' }]);
  });

  it('is free, not remote-in-use, when nobody is logged in', () => {
    const folded = PcUsageService.foldVirtual([{ pcId: 'vdesktop', name: null }]);
    expect(folded.users).toEqual([]);
    expect(folded.status).toBe(PcStatusType.FREE);
  });

  it('drops lockedAt, which only describes a single session', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesktop', memberId: 1, name: 'Jane', lockedAt: new Date().toISOString() },
    ]);
    expect(folded.lockedAt).toBeNull();
  });
});

describe('PcUsageService.mergeLockedAt', () => {
  it('takes the reported timestamp for a lock first detected', () => {
    const detected = new Date('2026-09-04T10:00:00Z');
    expect(PcUsageService.mergeLockedAt(null, detected)).toBe(detected);
  });

  it('keeps the earlier timestamp while the same lock keeps being reported', () => {
    const start = new Date('2026-09-04T10:00:00Z');
    const nextReport = new Date('2026-09-04T10:05:00Z');
    expect(PcUsageService.mergeLockedAt(start, nextReport)).toBe(start);
  });

  it('takes the reported timestamp when it is earlier than the stored one', () => {
    // A reporter ahead of the server clock must not push the start forward.
    const stored = new Date('2026-09-04T10:05:00Z');
    const reported = new Date('2026-09-04T10:00:00Z');
    expect(PcUsageService.mergeLockedAt(stored, reported)).toBe(reported);
  });

  it('clears the timestamp when the report says the PC is no longer locked', () => {
    const stored = new Date('2026-09-04T10:00:00Z');
    expect(PcUsageService.mergeLockedAt(stored, null)).toBeNull();
  });
});
