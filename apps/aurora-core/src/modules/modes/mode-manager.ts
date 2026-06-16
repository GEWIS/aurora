import BaseMode from './base-mode';
import { MusicEmitter } from '../events';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';
import EmitterStore from '../events/emitter-store';

export default class ModeManager {
  private static instance: ModeManager;

  private _emitterStore: EmitterStore;

  private modes: Map<typeof BaseMode, BaseMode<any, any, any> | undefined> = new Map();

  private initialized = false;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ModeManager();
    }
    return this.instance;
  }

  public init(emitterStore: EmitterStore) {
    if (this.initialized) throw new Error('ModeManager already initialized');
    this._emitterStore = emitterStore;
    this.initialized = true;
  }

  public enableMode(
    modeClass: typeof BaseMode<any, any, any>,
    mode: BaseMode<any, any, any>,
    name: string,
  ) {
    // If an instance of this mode already exist, destroy it before creating a new one
    if (this.modes.has(modeClass)) this.disableMode(modeClass);

    this.modes.set(modeClass, mode);
    this._emitterStore.backofficeSyncEmitter.emit(`mode_${name}_update`);
  }

  public getMode(modeClass: typeof BaseMode<any, any, any>) {
    return this.modes.get(modeClass);
  }

  public disableMode(modeClass: typeof BaseMode<any, any, any>, name?: string) {
    const instance = this.modes.get(modeClass);
    if (instance) instance.destroy();
    if (name) this._emitterStore.backofficeSyncEmitter.emit(`mode_${name}_update`);
    return this.modes.delete(modeClass);
  }

  public get musicEmitter() {
    return this._emitterStore.musicEmitter;
  }

  public get backofficeSyncEmitter() {
    return this._emitterStore.backofficeSyncEmitter;
  }

  /**
   * Stops all modes
   */
  public reset() {
    this.modes.forEach((mode, modeClass) => {
      mode?.destroy();
      this.modes.delete(modeClass);
    });
  }
}
