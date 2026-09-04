import { describe, it, expect, vi } from 'vitest';
import { ValueTransformer } from 'typeorm';
import { jsonTransformer } from './transformers';

vi.mock('../logger', () => ({ default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

describe('jsonTransformer', () => {
  const transformer = jsonTransformer<{ a: number }[]>() as ValueTransformer;

  it('round-trips a value', () => {
    const value = [{ a: 1 }];
    expect(transformer.from(transformer.to(value))).toEqual(value);
  });

  it('keeps null as null in both directions', () => {
    expect(transformer.to(null)).toBeNull();
    expect(transformer.from(null)).toBeNull();
  });

  it('reads a column that does not hold JSON as absent rather than throwing', () => {
    // A column whose contents predate the JSON shape (say a comma-separated
    // list left behind by a schema change) must not fail the whole query.
    expect(() => transformer.from('kim')).not.toThrow();
    expect(transformer.from('kim')).toBeNull();
    expect(transformer.from('')).toBeNull();
    expect(transformer.from('kim,cas')).toBeNull();
  });
});
