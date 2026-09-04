import { describe, it, expect } from 'vitest';
import { sBool, sNum, sStr } from './settings';

describe('settings helpers', () => {
  it('sBool reads booleans and falls back otherwise', () => {
    expect(sBool({ a: false }, 'a', true)).toBe(false);
    expect(sBool({ a: 'x' }, 'a', true)).toBe(true);
    expect(sBool(undefined, 'a', true)).toBe(true);
  });

  it('sStr reads strings and falls back otherwise', () => {
    expect(sStr({ a: 'analog' }, 'a', 'digital')).toBe('analog');
    expect(sStr({ a: 3 }, 'a', 'digital')).toBe('digital');
    expect(sStr(undefined, 'a', 'digital')).toBe('digital');
  });

  it('sNum reads numbers and falls back otherwise', () => {
    expect(sNum({ a: 42 }, 'a', 20)).toBe(42);
    expect(sNum({ a: 'x' }, 'a', 20)).toBe(20);
    expect(sNum(undefined, 'a', 20)).toBe(20);
  });
});
