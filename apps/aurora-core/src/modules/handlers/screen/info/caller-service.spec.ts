import { describe, it, expect } from 'vitest';
import CallerService from './caller-service';

const callers = [
  { name: 'GEWIS', numbers: ['gewis@tue.nl'], photoUrl: 'gewis.svg' },
  { name: 'Sako Arts', numbers: ['+31 6 3019 9293', 's.arts@student.tue.nl'], photoUrl: null },
];

describe('CallerService.normalize', () => {
  it('strips spaces, dashes and parentheses', () => {
    expect(CallerService.normalize('+31 (6) 3019-9293')).toBe('+31630199293');
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
    const e = CallerService.matchCaller('+31630199293', callers);
    expect(e).toMatchObject({ ringing: true, known: true, name: 'Sako Arts' });
  });

  it('reports an unknown caller as ringing but not known', () => {
    const e = CallerService.matchCaller('+31600000000', callers);
    expect(e).toMatchObject({ ringing: true, known: false, name: null });
  });
});
