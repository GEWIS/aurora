import { Server } from 'socket.io';
import { FeatureFlagManager, ServerSettingsStore } from '../server-settings';
import { SocketioNamespaces } from '../../socketio-namespaces';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';

export const MIN_SCREEN_BRIGHTNESS = 10;

export const DEFAULT_TRANSITION_SECONDS = 5;

export interface ScreenFilterState {
  /**
   * Brightness of all screens as a percentage (100 is no dimming)
   * @isInt
   * @minimum 0
   * @maximum 100
   */
  brightness: number;
  /**
   * Strength of the blue light filter as a percentage (0 is no filter)
   * @isInt
   * @minimum 0
   * @maximum 100
   */
  warmth: number;
}

export interface ScreenFilterParams extends ScreenFilterState {
  /**
   * Duration in seconds over which screens gradually fade to the new filter
   * @isInt
   * @minimum 0
   * @maximum 3600
   */
  transitionSeconds?: number;
}

/**
 * Message sent to screens whenever the filter changes
 */
export interface ScreenFilterEvent extends ScreenFilterState {
  transitionSeconds: number;
}

/**
 * Filter that leaves screens untouched, shown when the screen filter is disabled
 */
const NO_SCREEN_FILTER: ScreenFilterState = { brightness: 100, warmth: 0 };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

/**
 * Global dimming / blue light filter that is applied on top of all screens
 */
export default class ScreenFilterManager {
  private static instance: ScreenFilterManager;

  private io?: Server;

  private backofficeSyncEmitter?: BackofficeSyncEmitter;

  /**
   * Whether setState() is writing the filter, such that its individual
   * setting changes do not each trigger a broadcast
   */
  private updating = false;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ScreenFilterManager();
    }
    return this.instance;
  }

  /**
   * Connect the manager to the websocket server, such that screens
   * and backoffices are notified of any changes
   * @param io
   * @param backofficeSyncEmitter
   */
  public init(io: Server, backofficeSyncEmitter: BackofficeSyncEmitter) {
    this.io = io;
    this.backofficeSyncEmitter = backofficeSyncEmitter;

    // Remove or restore the filter on all screens when the feature is toggled,
    // or when the filter is changed directly through the server settings
    ServerSettingsStore.getInstance().onSettingChange((key) => {
      if (key === 'ScreenFilter') this.broadcast(DEFAULT_TRANSITION_SECONDS);
      if (key === 'ScreenFilter.Brightness' || key === 'ScreenFilter.Warmth') {
        if (!this.updating) this.broadcast(DEFAULT_TRANSITION_SECONDS);
      }
    });
  }

  /**
   * Get the current filter. The stored values are clamped, because they can
   * also be changed directly through the server settings
   */
  public getState(): ScreenFilterState {
    const store = ServerSettingsStore.getInstance();
    return {
      brightness: clamp(
        store.getSetting('ScreenFilter.Brightness') as number,
        MIN_SCREEN_BRIGHTNESS,
        100,
      ),
      warmth: clamp(store.getSetting('ScreenFilter.Warmth') as number, 0, 100),
    };
  }

  public async setState(params: ScreenFilterParams): Promise<ScreenFilterState> {
    const store = ServerSettingsStore.getInstance();
    this.updating = true;
    try {
      await store.setSetting(
        'ScreenFilter.Brightness',
        clamp(params.brightness, MIN_SCREEN_BRIGHTNESS, 100),
      );
      await store.setSetting('ScreenFilter.Warmth', clamp(params.warmth, 0, 100));
    } finally {
      this.updating = false;
    }

    this.broadcast(params.transitionSeconds ?? DEFAULT_TRANSITION_SECONDS);
    return this.getState();
  }

  /**
   * Notify screens and backoffices of the current filter
   * @param transitionSeconds
   */
  private broadcast(transitionSeconds: number) {
    const enabled = FeatureFlagManager.getInstance().flagIsEnabled('ScreenFilter');
    const event: ScreenFilterEvent = {
      ...(enabled ? this.getState() : NO_SCREEN_FILTER),
      transitionSeconds,
    };
    this.io?.of(SocketioNamespaces.SCREEN).emit('screen_filter', event);
    this.backofficeSyncEmitter?.emit('screen_filter_update');
  }
}
