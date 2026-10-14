import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Socket } from 'socket.io-client';
import { BorrelModeState, getBorrelMode } from '@gewis/aurora-api-client';
import useBorrelMode from './useBorrelMode';

vi.mock('@gewis/aurora-api-client', () => ({
  getBorrelMode: vi.fn(),
}));

type FetchResult = Awaited<ReturnType<typeof getBorrelMode>>;

function fakeSocket() {
  const listeners = new Map<string, (state?: BorrelModeState) => void>();
  const socket = {
    on: vi.fn((event: string, cb: (state?: BorrelModeState) => void) => listeners.set(event, cb)),
    off: vi.fn((event: string) => listeners.delete(event)),
  };
  return { socket: socket as unknown as Socket, listeners };
}

describe('useBorrelMode', () => {
  it('does not overwrite a socket event with a slower initial fetch', async () => {
    const { promise, resolve: resolveFetch } = Promise.withResolvers<FetchResult>();
    vi.mocked(getBorrelMode).mockReturnValue(promise as ReturnType<typeof getBorrelMode>);
    const { socket, listeners } = fakeSocket();

    const { result } = renderHook(() => useBorrelMode(socket));
    act(() => listeners.get('borrel_mode')!({ present: true, enabled: true }));
    resolveFetch({ data: { present: true, enabled: false } } as FetchResult);
    await act(async () => {});

    expect(result.current).toBe(true);
  });

  it('fetches the state again after reconnecting, as events may have been missed', async () => {
    vi.mocked(getBorrelMode).mockResolvedValue({
      data: { present: true, enabled: false },
    } as FetchResult);
    const { socket, listeners } = fakeSocket();

    const { result, unmount } = renderHook(() => useBorrelMode(socket));
    await act(async () => {});
    expect(result.current).toBe(false);

    vi.mocked(getBorrelMode).mockResolvedValue({
      data: { present: true, enabled: true },
    } as FetchResult);
    listeners.get('connect')!();
    await act(async () => {});
    expect(result.current).toBe(true);

    unmount();
    expect(listeners.has('borrel_mode')).toBe(false);
    expect(listeners.has('connect')).toBe(false);
  });
});
