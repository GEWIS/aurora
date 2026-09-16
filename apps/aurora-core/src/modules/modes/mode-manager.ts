import Mode from './mode';
import ModeSession from './mode-session';

type ModeKey = abstract new (...args: never[]) => Mode;
import EmitterStore from '../events/emitter-store';

export default class ModeManager {
  private static instance: ModeManager;

  private _emitterStore: EmitterStore;

  private modes: Map<ModeKey, { mode: Mode; session: ModeSession }> = new Map();

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

  public async enableMode<T extends Mode>(
    modeClass: ModeKey,
    name: string,
    session: ModeSession,
    createMode: () => T | Promise<T>,
  ): Promise<T> {
    // If an instance of this mode already exist, destroy it before creating a new one
    if (this.modes.has(modeClass)) this.disableMode(modeClass);

    const mode = await createMode();

    this.modes.set(modeClass, { mode, session });
    this._emitterStore.backofficeSyncEmitter.emit(`mode_${name}_update`);
    return mode;
  }

  public getMode(modeClass: ModeKey) {
    return this.modes.get(modeClass)?.mode;
  }

  public disableMode(modeClass: ModeKey, name?: string) {
    const running = this.modes.get(modeClass);
    if (running) {
      running.mode.destroy();
      running.session.release();
    }
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
    this.modes.forEach((running, modeClass) => {
      running.mode.destroy();
      running.session.release();
      this.modes.delete(modeClass);
    });
  }
}
