import { describe, it, expect } from 'vitest';
import PcUsageService from './pc-usage-service';
import Keyholder from './entities/keyholder';

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
    keyholder({ name: 'Candidate+Key', isCandidateBoard: true, isKeyholder: true, usernames: ['CK'] }),
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
