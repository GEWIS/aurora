import { describe, it, expect, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { Socket } from 'socket.io-client';
import { getScreenFilter } from '@gewis/aurora-api-client';
import ScreenFilterOverlay, { ScreenFilterEvent } from './ScreenFilterOverlay';

vi.mock('@gewis/aurora-api-client', () => ({
  getScreenFilter: vi.fn(),
}));

function fakeSocket() {
  const listeners = new Map<string, (state?: ScreenFilterEvent) => void>();
  const socket = {
    on: vi.fn((event: string, cb: (state?: ScreenFilterEvent) => void) => listeners.set(event, cb)),
    off: vi.fn((event: string) => listeners.delete(event)),
  };
  return { socket: socket as unknown as Socket, listeners };
}

function layers(container: HTMLElement) {
  const [warmth, dim] = Array.from(container.querySelectorAll('div'));
  return { warmth, dim };
}

describe('ScreenFilterOverlay', () => {
  it('applies the filter fetched on mount', async () => {
    vi.mocked(getScreenFilter).mockResolvedValue({
      data: { brightness: 60, warmth: 100 },
    } as Awaited<ReturnType<typeof getScreenFilter>>);
    const { socket } = fakeSocket();

    const { container } = render(<ScreenFilterOverlay socket={socket} />);
    await act(async () => {});

    const { warmth, dim } = layers(container);
    expect(Number(dim.style.opacity)).toBeCloseTo(0.4);
    expect(Number(warmth.style.opacity)).toBeCloseTo(0.5);
    // No fade when (re)loading the page
    expect(dim.style.transitionDuration).toBe('0s');
  });

  it('updates on a socket event and unsubscribes on unmount', async () => {
    vi.mocked(getScreenFilter).mockResolvedValue({
      data: { brightness: 100, warmth: 0 },
    } as Awaited<ReturnType<typeof getScreenFilter>>);
    const { socket, listeners } = fakeSocket();

    const { container, unmount } = render(<ScreenFilterOverlay socket={socket} />);
    await act(async () => {});
    expect(Number(layers(container).dim.style.opacity)).toBe(0);

    act(() =>
      listeners.get('screen_filter')!({ brightness: 20, warmth: 0, transitionSeconds: 900 }),
    );
    const { warmth, dim } = layers(container);
    expect(Number(dim.style.opacity)).toBeCloseTo(0.8);
    expect(dim.style.transitionDuration).toBe('900s');
    expect(warmth.style.transitionDuration).toBe('900s');

    unmount();
    expect(listeners.has('screen_filter')).toBe(false);
  });

  it('does not overwrite a socket event with a slower initial fetch', async () => {
    let resolveFetch!: (res: Awaited<ReturnType<typeof getScreenFilter>>) => void;
    vi.mocked(getScreenFilter).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }) as ReturnType<typeof getScreenFilter>,
    );
    const { socket, listeners } = fakeSocket();

    const { container } = render(<ScreenFilterOverlay socket={socket} />);
    act(() => listeners.get('screen_filter')!({ brightness: 20, warmth: 0, transitionSeconds: 5 }));
    resolveFetch({ data: { brightness: 100, warmth: 0 } } as Awaited<
      ReturnType<typeof getScreenFilter>
    >);
    await act(async () => {});

    const { dim } = layers(container);
    expect(Number(dim.style.opacity)).toBeCloseTo(0.8);
    expect(dim.style.transitionDuration).toBe('5s');
  });

  it('fetches the filter again after reconnecting', async () => {
    vi.mocked(getScreenFilter).mockResolvedValue({
      data: { brightness: 100, warmth: 0 },
    } as Awaited<ReturnType<typeof getScreenFilter>>);
    const { socket, listeners } = fakeSocket();

    const { container, unmount } = render(<ScreenFilterOverlay socket={socket} />);
    await act(async () => {});

    vi.mocked(getScreenFilter).mockResolvedValue({
      data: { brightness: 50, warmth: 0 },
    } as Awaited<ReturnType<typeof getScreenFilter>>);
    listeners.get('connect')!();
    await act(async () => {});

    expect(Number(layers(container).dim.style.opacity)).toBeCloseTo(0.5);

    unmount();
    expect(listeners.has('connect')).toBe(false);
  });

  it('removes the filter when the refetch fails, e.g. because the feature was disabled', async () => {
    vi.mocked(getScreenFilter).mockResolvedValue({
      data: { brightness: 20, warmth: 0 },
    } as Awaited<ReturnType<typeof getScreenFilter>>);
    const { socket, listeners } = fakeSocket();

    const { container } = render(<ScreenFilterOverlay socket={socket} />);
    await act(async () => {});
    expect(Number(layers(container).dim.style.opacity)).toBeCloseTo(0.8);

    vi.mocked(getScreenFilter).mockResolvedValue({
      error: 'Feature is disabled',
    } as unknown as Awaited<ReturnType<typeof getScreenFilter>>);
    listeners.get('connect')!();
    await act(async () => {});

    expect(Number(layers(container).dim.style.opacity)).toBe(0);
  });
});
