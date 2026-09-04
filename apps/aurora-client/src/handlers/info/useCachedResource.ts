import { useEffect, useRef, useState } from 'react';

/**
 * Last successful response per resource key, shared by every widget instance for
 * the lifetime of the page.
 *
 * Container widgets (carousel, status stack) unmount the child that is not
 * currently on screen, so a self-fetching widget restarts from nothing every
 * time it rotates back into view: it would paint the screen-wide broadcast value
 * (or an empty panel) until its own request came back. Keeping the last response
 * outside the component lets a remount paint the previous data on its first
 * frame while the refresh happens in the background.
 */
const cache = new Map<string, unknown>();

/** Forget every cached response (used by tests). */
export function clearResourceCache(): void {
  cache.clear();
}

/**
 * Poll a resource, seeded from the shared cache so a remount never flashes.
 *
 * `key` identifies the request — the endpoint plus the settings it depends on,
 * so two widgets configured the same way share one cache entry. A `null` key
 * disables fetching entirely and the widget simply follows `fallback`, which is
 * the screen-wide value the core broadcasts.
 */
export default function useCachedResource<T>(
  key: string | null,
  load: () => Promise<T | undefined>,
  intervalMs: number,
  fallback: T,
): T {
  const [value, setValue] = useState<T>(() =>
    key !== null && cache.has(key) ? (cache.get(key) as T) : fallback,
  );

  // `load` and `fallback` are rebuilt on every render; holding them in refs lets
  // the polling effect depend on the key alone, so it is not torn down and
  // restarted (re-fetching) whenever the parent re-renders.
  const loadRef = useRef(load);
  loadRef.current = load;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    if (key === null) return undefined;
    // On a changed key (the station setting was edited, say) show that key's own
    // last known value instead of the previous key's.
    setValue(cache.has(key) ? (cache.get(key) as T) : fallbackRef.current);

    let active = true;
    const run = async () => {
      try {
        const data = await loadRef.current();
        if (data === undefined) return;
        cache.set(key, data);
        if (active) setValue(data);
      } catch (e) {
        console.error(e);
      }
    };
    void run();
    const timer = setInterval(() => void run(), intervalMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [key, intervalMs]);

  return key === null ? fallback : value;
}
