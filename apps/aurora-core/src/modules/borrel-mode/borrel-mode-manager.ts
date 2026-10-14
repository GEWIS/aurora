import { Server } from 'socket.io';
import { FeatureFlagManager, ServerSettingsStore } from '../server-settings';
import { SocketioNamespaces } from '../../socketio-namespaces';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';
import { HttpApiException, HttpStatusCode } from '../../helpers/custom-error';

const FLAG = 'BorrelModePresent';

const CHECK_INTERVAL_MS = 60 * 1000;

const SCHEDULE_DAY = 4;
const SCHEDULE_HOUR = 16;
const SCHEDULE_MINUTE = 30;

export interface BorrelModeParams {
  enabled: boolean;
}

export interface BorrelModeState {
  present: boolean;
  enabled: boolean;
}

export type BorrelModeListener = (state: BorrelModeState) => void;

/**
 * Global borrel mode. Activated by the schedule or manually, and active until
 * the end of the day it was activated on.
 */
export default class BorrelModeManager {
  private static instance: BorrelModeManager;

  private io?: Server;

  private backofficeSyncEmitter?: BackofficeSyncEmitter;

  private activeDay: number | undefined;

  private listeners: BorrelModeListener[] = [];

  public static getInstance() {
    if (!this.instance) {
      this.instance = new BorrelModeManager();
    }
    return this.instance;
  }

  /**
   * Connect the manager to the websocket server and start the schedule
   * @param io
   * @param backofficeSyncEmitter
   */
  public init(io: Server, backofficeSyncEmitter: BackofficeSyncEmitter) {
    this.io = io;
    this.backofficeSyncEmitter = backofficeSyncEmitter;

    setInterval(() => this.checkSchedule(new Date()), CHECK_INTERVAL_MS);

    ServerSettingsStore.getInstance().onSettingChange((key) => {
      if (key !== FLAG) return;
      if (!this.isPresent()) this.activeDay = undefined;
      this.broadcast();
    });
  }

  public isPresent(): boolean {
    return FeatureFlagManager.getInstance().flagIsEnabled(FLAG);
  }

  public isActive(): boolean {
    return this.isPresent() && this.activeDay !== undefined;
  }

  public getState(): BorrelModeState {
    return { present: this.isPresent(), enabled: this.isActive() };
  }

  public setActive(enabled: boolean): BorrelModeState {
    if (!this.isPresent()) {
      throw new HttpApiException(
        HttpStatusCode.Conflict,
        `Borrel mode is disabled by setting "${FLAG}".`,
      );
    }
    this.update(enabled ? new Date().getDay() : undefined);
    return this.getState();
  }

  /**
   * Subscribe to activation changes
   * @param listener
   */
  public onChange(listener: BorrelModeListener) {
    this.listeners.push(listener);
  }

  private checkSchedule(now: Date) {
    if (!this.isPresent()) return;

    // Borrel mode only lasts for the day it was activated on
    if (this.activeDay !== undefined) {
      if (this.activeDay !== now.getDay()) this.update(undefined);
      return;
    }

    const minutes = now.getHours() * 60 + now.getMinutes();
    if (now.getDay() === SCHEDULE_DAY && minutes >= SCHEDULE_HOUR * 60 + SCHEDULE_MINUTE) {
      this.update(now.getDay());
    }
  }

  /** Change the active day, broadcasting only when activation actually flips */
  private update(activeDay: number | undefined) {
    const wasActive = this.isActive();
    this.activeDay = activeDay;
    if (wasActive !== this.isActive()) this.broadcast();
  }

  /** Notify screens, backoffices and in-process listeners of the current state */
  private broadcast() {
    const state = this.getState();
    this.io?.of(SocketioNamespaces.SCREEN).emit('borrel_mode', state);
    this.backofficeSyncEmitter?.emit('borrel_mode_update');
    this.listeners.forEach((listener) => listener(state));
  }
}
