import { describe, it, expect } from 'vitest';
import { censorPhoneNumber, parsePhoneNumber, presentUnknownCaller } from './caller-number';

describe('parsePhoneNumber', () => {
  it('strips separators', () => {
    expect(parsePhoneNumber('+31 (6) 1234-5678')).toBe('+31612345678');
    expect(parsePhoneNumber('040 - 247 2002')).toBe('0402472002');
  });

  it('rewrites a 00 international prefix to +', () => {
    expect(parsePhoneNumber('0031612345678')).toBe('+31612345678');
  });

  it('extracts the number from a SIP or tel URI', () => {
    expect(parsePhoneNumber('sip:+31612345678@pbx.tue.nl;user=phone')).toBe('+31612345678');
    expect(parsePhoneNumber('tel:+31612345678')).toBe('+31612345678');
  });

  it('rejects addresses and names', () => {
    expect(parsePhoneNumber('gewis@tue.nl')).toBeNull();
    expect(parsePhoneNumber('Jane Doe')).toBeNull();
    expect(parsePhoneNumber('')).toBeNull();
    expect(parsePhoneNumber(null)).toBeNull();
  });
});

describe('censorPhoneNumber', () => {
  it('keeps the Dutch mobile prefix', () => {
    expect(censorPhoneNumber('+31612345678')).toBe('+31 6 ****5678');
    expect(censorPhoneNumber('0612345678')).toBe('06 ****5678');
  });

  it('keeps a two-digit Dutch area code', () => {
    expect(censorPhoneNumber('0402472002')).toBe('040 ***2002');
    expect(censorPhoneNumber('+31402472002')).toBe('+31 40 ***2002');
  });

  it('keeps a three-digit Dutch area code', () => {
    expect(censorPhoneNumber('0495123456')).toBe('0495 **3456');
  });

  it('keeps only the country code of a foreign number', () => {
    expect(censorPhoneNumber('+4930123456789')).toBe('+49 *******6789');
    expect(censorPhoneNumber('+12025550123')).toBe('+1 ******0123');
    expect(censorPhoneNumber('+352123456')).toBe('+352 **3456');
  });

  it('masks all but the last four digits of an extension', () => {
    expect(censorPhoneNumber('72002')).toBe('*2002');
  });
});

describe('presentUnknownCaller', () => {
  it('shows the number in full', () => {
    expect(presentUnknownCaller('+31 6 1234 5678', null, 'full')).toBe('+31612345678');
    expect(presentUnknownCaller('someone@tue.nl', null, 'full')).toBe('someone@tue.nl');
  });

  it('shows a censored number, and nothing for an address', () => {
    expect(presentUnknownCaller('+31612345678', null, 'censored')).toBe('+31 6 ****5678');
    expect(presentUnknownCaller('someone@tue.nl', null, 'censored')).toBeNull();
  });

  it('hides the number', () => {
    expect(presentUnknownCaller('+31612345678', null, 'hidden')).toBeNull();
  });

  it('shows a reported name regardless of the setting', () => {
    expect(presentUnknownCaller('+31612345678', 'Jane Doe', 'hidden')).toBe('Jane Doe');
  });

  it('treats a reported name that is a number as the number', () => {
    expect(presentUnknownCaller(null, '+31612345678', 'hidden')).toBeNull();
    expect(presentUnknownCaller(null, '+31612345678', 'censored')).toBe('+31 6 ****5678');
    expect(presentUnknownCaller('+31612345678', '+31612345678', 'hidden')).toBeNull();
  });

  it('falls back to hiding the number for an unrecognised setting', () => {
    expect(presentUnknownCaller('+31612345678', null, 'bogus' as never)).toBeNull();
  });
});
