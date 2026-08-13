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
    usernames: [],
    ...overrides,
  });
}

describe('PcUsageService.deriveSymbol', () => {
  const keyholders = [
    keyholder({ name: 'Board', isBoard: true, usernames: ['BEST'] }),
    keyholder({
      name: 'Candidate+Key',
      isCandidateBoard: true,
      isKeyholder: true,
      usernames: ['CK'],
    }),
    keyholder({ name: 'Candidate', isCandidateBoard: true, usernames: ['CAND'] }),
    keyholder({ name: 'Key', isKeyholder: true, usernames: ['KEY'] }),
  ];

  it('prefers the board symbol', () => {
    expect(PcUsageService.deriveSymbol('best', keyholders)).toBe('★');
  });

  it('uses the candidate+keyholder symbol', () => {
    expect(PcUsageService.deriveSymbol('CK', keyholders)).toBe('🍭');
  });

  it('uses the candidate symbol', () => {
    expect(PcUsageService.deriveSymbol('CAND', keyholders)).toBe('🍬');
  });

  it('uses the keyholder symbol', () => {
    expect(PcUsageService.deriveSymbol('KEY', keyholders)).toBe('🔑');
  });

  it('returns empty for unknown or null usernames', () => {
    expect(PcUsageService.deriveSymbol('unknown', keyholders)).toBe('');
    expect(PcUsageService.deriveSymbol(null, keyholders)).toBe('');
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
      { pcId: 'vdesk-a', username: 'jdoe', remote: true },
      { pcId: 'vdesk-b', username: 'jane', remote: true },
    ]);
    expect(folded.usernames).toEqual(['jdoe', 'jane']);
    expect(folded.status).toBe(PcStatusType.REMOTE);
    expect(folded.remote).toBe(true);
  });

  it('de-duplicates a user with two sessions', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesk-a', username: 'jdoe' },
      { pcId: 'vdesk-b', username: 'jdoe' },
    ]);
    expect(folded.usernames).toEqual(['jdoe']);
  });

  it('ignores sessions with no real user', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesk-a', username: null },
      { pcId: 'vdesk-b', username: '' },
      { pcId: 'vdesk-c', username: '-' },
      { pcId: 'vdesk-d', username: '  jane  ' },
    ]);
    expect(folded.usernames).toEqual(['jane']);
  });

  it('is free, not remote-in-use, when nobody is logged in', () => {
    const folded = PcUsageService.foldVirtual([{ pcId: 'vdesk-a', username: null }]);
    expect(folded.usernames).toEqual([]);
    expect(folded.status).toBe(PcStatusType.FREE);
  });

  it('drops lockedAt, which only describes a single session', () => {
    const folded = PcUsageService.foldVirtual([
      { pcId: 'vdesk-a', username: 'jdoe', lockedAt: new Date().toISOString() },
    ]);
    expect(folded.lockedAt).toBeNull();
  });
});
