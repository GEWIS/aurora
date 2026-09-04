import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import useCachedResource, { clearResourceCache } from './useCachedResource';

function Probe({
  cacheKey,
  load,
  fallback,
}: {
  cacheKey: string | null;
  load: () => Promise<string | undefined>;
  fallback: string;
}) {
  const value = useCachedResource(cacheKey, load, 30_000, fallback);
  return <span data-testid="value">{value}</span>;
}

const value = () => screen.getByTestId('value').textContent;

describe('useCachedResource', () => {
  beforeEach(() => clearResourceCache());

  it('shows the fallback first, then the loaded value', async () => {
    const load = vi.fn().mockResolvedValue('fetched');
    render(<Probe cacheKey="k" load={load} fallback="broadcast" />);
    expect(value()).toBe('broadcast');
    await act(async () => {});
    expect(value()).toBe('fetched');
  });

  it('paints the cached value on the first frame after a remount', async () => {
    const load = vi.fn().mockResolvedValue('fetched');
    const first = render(<Probe cacheKey="k" load={load} fallback="broadcast" />);
    await act(async () => {});
    first.unmount();

    // What a carousel does when the child rotates back into view: the fallback
    // must never be painted again now that the resource has been loaded once.
    render(<Probe cacheKey="k" load={load} fallback="broadcast" />);
    expect(value()).toBe('fetched');
  });

  it("does not reuse another key's value", async () => {
    const load = vi.fn().mockResolvedValue('ehv');
    const first = render(<Probe cacheKey="trains:EHV" load={load} fallback="broadcast" />);
    await act(async () => {});
    first.unmount();

    render(
      <Probe cacheKey="trains:ASD" load={vi.fn().mockResolvedValue('asd')} fallback="broadcast" />,
    );
    expect(value()).toBe('broadcast');
  });

  it('follows the fallback and never fetches when the key is null', async () => {
    const load = vi.fn();
    const { rerender } = render(<Probe cacheKey={null} load={load} fallback="first" />);
    await act(async () => {});
    expect(value()).toBe('first');

    rerender(<Probe cacheKey={null} load={load} fallback="second" />);
    expect(value()).toBe('second');
    expect(load).not.toHaveBeenCalled();
  });

  it('keeps the last value when a refresh fails', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce('fetched')
      .mockRejectedValueOnce(new Error('offline'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<Probe cacheKey="k" load={load} fallback="broadcast" />);
    await act(async () => {});
    expect(value()).toBe('fetched');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(load).toHaveBeenCalledTimes(2);
    expect(value()).toBe('fetched');
    vi.useRealTimers();
  });
});
