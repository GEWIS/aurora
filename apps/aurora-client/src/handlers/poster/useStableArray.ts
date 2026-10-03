import { useState } from 'react';

function sameItems<T>(a: readonly T[], b: readonly T[]) {
  return a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
}

/**
 * Returns `value`, but keeps returning the previous array as long as its items are equal.
 *
 * Poster props are rebuilt on every poster refresh (e.g. `poster.files.map(…)`), so the
 * array is a new reference even when nothing changed. Hooks that depend on the result of
 * this hook only re-run when the contents actually change.
 */
export default function useStableArray<T>(value: T[]): T[] {
  const [stable, setStable] = useState(value);

  if (stable !== value && !sameItems(stable, value)) {
    setStable(value);
    return value;
  }
  return stable;
}
