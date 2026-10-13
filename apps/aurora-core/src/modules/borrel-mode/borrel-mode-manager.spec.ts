import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Server } from 'socket.io';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';
import BorrelModeManager from './borrel-mode-manager';

const settings = new Map<string, unknown>();
let settingChangeListeners: ((key: string) => void)[] = [];

vi.mock('../server-settings', () => ({
  ServerSettingsStore: {
    getInstance: () => ({
      onSettingChange: (listener: (key: string) => void) => {
        settingChangeListeners.push(listener);
      },
    }),
  },
  FeatureFlagManager: {
    getInstance: () => ({
      flagIsEnabled: (key: string) => !!settings.get(key),
    }),
  },
}));

const MINUTE = 60 * 1000;

/** 2026-10-15 is a Thursday; months are zero-based */
const thursday = (hour: number, minute: number) => new Date(2026, 9, 15, hour, minute);

function setup() {
  const emit = vi.fn();
  const io = { of: vi.fn(() => ({ emit })) } as unknown as Server;
  const backofficeSyncEmitter = { emit: vi.fn() } as unknown as BackofficeSyncEmitter;
  const listener = vi.fn();
  const manager = new BorrelModeManager();
  manager.init(io, backofficeSyncEmitter);
  manager.onChange(listener);
  return { manager, emit, backofficeSyncEmitter, listener };
}

function setFlag(enabled: boolean) {
  settings.set('Poster.BorrelModePresent', enabled);
  settingChangeListeners.forEach((listener) => listener('Poster.BorrelModePresent'));
}

beforeEach(() => {
  vi.useFakeTimers();
  settings.clear();
  settings.set('Poster.BorrelModePresent', true);
  settingChangeListeners = [];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('BorrelModeManager schedule', () => {
  it('activates on Thursday from 16:30 and notifies everyone once', () => {
    vi.setSystemTime(thursday(16, 28));
    const { manager, emit, backofficeSyncEmitter, listener } = setup();

    vi.advanceTimersByTime(MINUTE); // 16:29
    expect(manager.isActive()).toBe(false);
    expect(emit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(MINUTE); // 16:30
    expect(manager.isActive()).toBe(true);
    expect(emit).toHaveBeenCalledWith('borrel_mode', { present: true, enabled: true });
    expect(backofficeSyncEmitter.emit).toHaveBeenCalledWith('borrel_mode_update');
    expect(listener).toHaveBeenCalledWith({ present: true, enabled: true });

    vi.advanceTimersByTime(10 * MINUTE);
    expect(emit).toHaveBeenCalledOnce();
  });

  it('deactivates after midnight', () => {
    vi.setSystemTime(thursday(23, 58));
    const { manager, emit } = setup();
    vi.advanceTimersByTime(MINUTE); // 23:59
    expect(manager.isActive()).toBe(true);

    vi.advanceTimersByTime(MINUTE); // Friday 00:00
    expect(manager.isActive()).toBe(false);
    expect(emit).toHaveBeenLastCalledWith('borrel_mode', { present: true, enabled: false });
  });

  it('does not activate while the feature is disabled', () => {
    settings.set('Poster.BorrelModePresent', false);
    vi.setSystemTime(thursday(17, 0));
    const { manager, emit } = setup();

    vi.advanceTimersByTime(MINUTE);
    expect(manager.isActive()).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });
});

describe('BorrelModeManager.setActive', () => {
  it('keeps a manual activation until the end of that day', () => {
    // Tuesday, so the schedule itself would never activate
    vi.setSystemTime(new Date(2026, 9, 13, 22, 0));
    const { manager } = setup();

    expect(manager.setActive(true)).toEqual({ present: true, enabled: true });
    vi.advanceTimersByTime(60 * MINUTE); // 23:00
    expect(manager.isActive()).toBe(true);

    vi.advanceTimersByTime(60 * MINUTE); // Wednesday 00:00
    expect(manager.isActive()).toBe(false);
  });

  it('throws while the feature is disabled', () => {
    settings.set('Poster.BorrelModePresent', false);
    const { manager } = setup();

    expect(() => manager.setActive(true)).toThrow();
    expect(manager.isActive()).toBe(false);
  });
});

describe('BorrelModeManager feature flag', () => {
  it('deactivates and tells screens it is absent when the feature is disabled', () => {
    vi.setSystemTime(thursday(20, 0));
    const { manager, emit } = setup();
    manager.setActive(true);

    setFlag(false);
    expect(manager.getState()).toEqual({ present: false, enabled: false });
    expect(emit).toHaveBeenLastCalledWith('borrel_mode', { present: false, enabled: false });

    // Re-enabling does not bring back the earlier activation
    setFlag(true);
    expect(manager.getState()).toEqual({ present: true, enabled: false });
  });
});
