import { ColumnOptions } from 'typeorm';
import logger from '../logger';

export function jsonTransformer<T>(): ColumnOptions['transformer'] {
  return {
    from(value: string | null): T | null {
      if (value == null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        // A column that does not hold JSON is a single broken row, but throwing
        // here fails the whole query and takes every other row with it. Treat it
        // as absent instead: readers already cope with null (the column is
        // nullable), and the warning names the value so it can be fixed.
        logger.warn(`Ignoring non-JSON value in a JSON column: ${JSON.stringify(value)}`);
        return null;
      }
    },
    to(value: T | null): string | null {
      if (value == null) return null;
      return JSON.stringify(value);
    },
  };
}
