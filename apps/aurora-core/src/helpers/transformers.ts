import { ColumnOptions } from 'typeorm';

export function jsonTransformer<T>(): ColumnOptions['transformer'] {
  return {
    from(value: string | null): T | null {
      if (value == null) return null;
      return JSON.parse(value);
    },
    to(value: T | null): string | null {
      if (value == null) return null;
      return JSON.stringify(value);
    },
  };
}
