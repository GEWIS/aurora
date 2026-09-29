import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from 'socket.io';
import { ServerSettingsStore } from '../server-settings';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';
import ScreenFilterManager, {
  DEFAULT_TRANSITION_SECONDS,
  MIN_SCREEN_BRIGHTNESS,
} from './screen-filter-manager';

const settings = new Map<string, unknown>();
let settingChangeListeners: ((key: string) => void)[] = [];

vi.mock('../server-settings', () => ({
  ServerSettingsStore: {
    getInstance: () => ({
      getSetting: (key: string) => settings.get(key),
      setSetting: async (key: string, value: unknown) => {
        settings.set(key, value);
        settingChangeListeners.forEach((listener) => listener(key));
      },
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

function setup() {
  const emit = vi.fn();
  const io = { of: vi.fn(() => ({ emit })) } as unknown as Server;
  const backofficeSyncEmitter = { emit: vi.fn() } as unknown as BackofficeSyncEmitter;
  const manager = new ScreenFilterManager();
  manager.init(io, backofficeSyncEmitter);
  return { manager, emit, backofficeSyncEmitter };
}

describe('ScreenFilterManager.setState', () => {
  beforeEach(() => {
    settings.clear();
    settings.set('ScreenFilter', true);
    settingChangeListeners = [];
  });

  it('stores the filter and sends it to screens with the default transition', async () => {
    const { manager, emit, backofficeSyncEmitter } = setup();

    const state = await manager.setState({ brightness: 60, warmth: 40 });

    expect(state).toEqual({ brightness: 60, warmth: 40 });
    expect(ServerSettingsStore.getInstance().getSetting('ScreenFilter.Brightness')).toBe(60);
    expect(emit).toHaveBeenCalledWith('screen_filter', {
      brightness: 60,
      warmth: 40,
      transitionSeconds: DEFAULT_TRANSITION_SECONDS,
    });
    expect(backofficeSyncEmitter.emit).toHaveBeenCalledWith('screen_filter_update');
  });

  it('sends the given transition duration to screens', async () => {
    const { manager, emit } = setup();

    await manager.setState({ brightness: 50, warmth: 80, transitionSeconds: 900 });

    expect(emit).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith('screen_filter', {
      brightness: 50,
      warmth: 80,
      transitionSeconds: 900,
    });
  });

  it('never dims the screens completely', async () => {
    const { manager } = setup();

    const state = await manager.setState({ brightness: 0, warmth: 0 });

    expect(state.brightness).toBe(10);
  });

  it('stores the filter but does not apply it to screens when disabled', async () => {
    settings.set('ScreenFilter', false);
    const { manager, emit } = setup();

    const state = await manager.setState({ brightness: 60, warmth: 40 });

    expect(state).toEqual({ brightness: 60, warmth: 40 });
    expect(emit).toHaveBeenLastCalledWith('screen_filter', {
      brightness: 100,
      warmth: 0,
      transitionSeconds: DEFAULT_TRANSITION_SECONDS,
    });
  });

  it('removes and restores the filter on screens when toggled', async () => {
    const { manager, emit } = setup();
    await manager.setState({ brightness: 60, warmth: 40 });
    const store = ServerSettingsStore.getInstance();

    await store.setSetting('ScreenFilter', false);
    expect(emit).toHaveBeenLastCalledWith('screen_filter', {
      brightness: 100,
      warmth: 0,
      transitionSeconds: DEFAULT_TRANSITION_SECONDS,
    });

    await store.setSetting('ScreenFilter', true);
    expect(emit).toHaveBeenLastCalledWith('screen_filter', {
      brightness: 60,
      warmth: 40,
      transitionSeconds: DEFAULT_TRANSITION_SECONDS,
    });
  });
});

describe('ScreenFilterManager server settings', () => {
  beforeEach(() => {
    settings.clear();
    settings.set('ScreenFilter', true);
    settings.set('ScreenFilter.Brightness', 100);
    settings.set('ScreenFilter.Warmth', 0);
    settingChangeListeners = [];
  });

  it('sends the filter to screens when changed directly as a setting', async () => {
    const { emit } = setup();

    await ServerSettingsStore.getInstance().setSetting('ScreenFilter.Warmth', 30);

    expect(emit).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith('screen_filter', {
      brightness: 100,
      warmth: 30,
      transitionSeconds: DEFAULT_TRANSITION_SECONDS,
    });
  });

  it('never dims the screens completely when changed directly as a setting', async () => {
    const { manager, emit } = setup();

    await ServerSettingsStore.getInstance().setSetting('ScreenFilter.Brightness', 0);

    expect(manager.getState()).toEqual({ brightness: MIN_SCREEN_BRIGHTNESS, warmth: 0 });
    expect(emit).toHaveBeenCalledWith('screen_filter', {
      brightness: MIN_SCREEN_BRIGHTNESS,
      warmth: 0,
      transitionSeconds: DEFAULT_TRANSITION_SECONDS,
    });
  });
});
