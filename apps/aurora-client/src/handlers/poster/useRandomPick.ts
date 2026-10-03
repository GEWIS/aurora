import { useState } from 'react';
import useStableArray from './useStableArray';

function pickRandom<T>(options: T[]): T | undefined {
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * A random item from `options` that stays the same until the contents of `options` change.
 *
 * The pick is kept in state rather than `useMemo`, because React may drop memoized values
 * and that would show a different item mid-display.
 */
export default function useRandomPick<T>(options: T[]): T | undefined {
  const stableOptions = useStableArray(options);
  const [pick, setPick] = useState(() => ({
    options: stableOptions,
    value: pickRandom(stableOptions),
  }));

  if (pick.options !== stableOptions) {
    const next = { options: stableOptions, value: pickRandom(stableOptions) };
    setPick(next);
    return next.value;
  }
  return pick.value;
}
