import { describe, it, expect } from 'vitest';
import CallerService from './caller-service';

const callers = [
  { name: 'GEWIS', numbers: ['gewis@tue.nl'], photoUrl: 'gewis.svg' },
  { name: 'John Doe', numbers: ['+31 6 1234 5678', 'j.doe@student.tue.nl'], photoUrl: null },
];

describe('CallerService.normalize', () => {
  it('strips spaces, dashes and parentheses', () => {
    expect(CallerService.normalize('+31 (6) 1234-5678')).toBe('+31612345678');
  });

  it('normalises SIP addresses to lower case', () => {
    expect(CallerService.normalize('GEWIS@tue.nl')).toBe('gewis@tue.nl');
  });
});

describe('CallerService.matchCaller', () => {
  it('treats "0" and empty as not ringing', () => {
    expect(CallerService.matchCaller('0', callers).ringing).toBe(false);
    expect(CallerService.matchCaller('', callers).ringing).toBe(false);
    expect(CallerService.matchCaller(null, callers).ringing).toBe(false);
  });

  it('matches a known SIP address', () => {
    const e = CallerService.matchCaller('gewis@tue.nl', callers);
    expect(e).toMatchObject({ ringing: true, known: true, name: 'GEWIS', photoUrl: 'gewis.svg' });
  });

  it('matches a known phone number regardless of formatting', () => {
    const e = CallerService.matchCaller('+31612345678', callers);
    expect(e).toMatchObject({ ringing: true, known: true, name: 'John Doe' });
  });

  it('reports an unknown caller as ringing but not known', () => {
    const e = CallerService.matchCaller('+31656789123', callers);
    expect(e).toMatchObject({ ringing: true, known: false, name: null });
  });

  it('keeps the reported name for a caller outside the directory', () => {
    const e = CallerService.matchCaller('+31687654321', callers, 'Ada Lovelace');
    expect(e).toMatchObject({ ringing: true, known: false, name: 'Ada Lovelace', photoUrl: null });
  });

  it('prefers the directory name over the reported one', () => {
    const e = CallerService.matchCaller('+31612345678', callers, 'Unknown Caller');
    expect(e).toMatchObject({ known: true, name: 'John Doe' });
  });

  it('rings a named caller that has no number at all (Teams-to-Teams)', () => {
    const e = CallerService.matchCaller(null, callers, 'Jane Doe');
    expect(e).toMatchObject({ ringing: true, known: false, name: 'Jane Doe' });
  });

  it('does not ring on a blank reported name without a number', () => {
    expect(CallerService.matchCaller('', callers, '   ').ringing).toBe(false);
  });
});
