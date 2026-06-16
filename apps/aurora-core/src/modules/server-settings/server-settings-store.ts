import { Repository } from 'typeorm';
import ServerSetting, { ISettings, SettingsDefaults } from './server-setting';
import dataSource from '../../database';
import { FileStorage } from '../files/storage/file-storage';
import { DiskStorage } from '../files/storage';

export type FeatureFlagResponse = {
  key: string;
  value: boolean;
}[];

/**
 * Store of global server settings, which are key-value pairs stored in the database.
 * Used for settings that fit a database store better than an environment variable,
 * as the latter should contain mostly secrets to get things to work, not to
 * configure stuff.
 */
export default class ServerSettingsStore<T extends keyof ISettings = keyof ISettings> {
  private static instance: ServerSettingsStore;

  private initialized = false;

  private repo: Repository<ServerSetting>;

  private settings: ISettings;

  constructor() {
    this.repo = dataSource.getRepository(ServerSetting);
  }

  /**
   * Singleton, because there is only one copy of the core running at a time.
   * We can therefore simply initialize the store once and keep it up to date
   * from memory.
   */
  public static getInstance() {
    if (!this.instance) {
      this.instance = new ServerSettingsStore();
    }
    return this.instance;
  }

  /**
   * Whether the store is initialized
   */
  public isInitialized() {
    return this.initialized;
  }

  /**
   * Throw an error if store is not initialized
   */
  public throwIfNotInitialized() {
    if (!this.initialized) throw new Error('ServerSettingsStore has not been initialized.');
  }

  /**
   * Fetch all key-value pairs from the database
   */
  public async initialize() {
    if (this.initialized) {
      throw new Error('ServerSettingsStore already initialized!');
    }

    const settings = await this.repo.find();
    const promises: Promise<ServerSetting>[] = [];

    // Save any new key-value pairs to the database if they don't yet exist
    Object.entries(SettingsDefaults).forEach((entry) => {
      const key = entry[0] as keyof ISettings;
      const value = entry[1];
      const setting = settings.find((s) => s.key === key);
      if (!setting) {
        const promise = this.repo.save({ key, value });
        // Add the missing setting key with its default value
        promises.push(promise);
      }
    });

    // The settings object now contains all key-value pairs
    settings.push(...(await Promise.all(promises)));

    const map = new Map<ServerSetting['key'], ServerSetting['value']>();
    Object.keys(SettingsDefaults).forEach((key) => {
      const setting = settings.find((s) => s.key === key);
      if (!setting) throw new Error(`Setting "${key}" missing during initialization`);
      map.set(setting.key, setting.value);
    });

    this.settings = Object.fromEntries(map) as any as ISettings;
    this.initialized = true;
  }

  /**
   * Return whether the given key is a server setting
   * @param key
   */
  public hasSetting(key: string): boolean {
    return Object.keys(this.settings).includes(key);
  }

  /**
   * Get all server settings.
   */
  public getSettings(): ISettings {
    this.throwIfNotInitialized();
    return this.settings;
  }

  /**
   * Get a server setting
   * @param key
   */
  public getSetting(key: T): ISettings[T] {
    this.throwIfNotInitialized();
    return this.settings[key];
  }

  /**
   * Update a server setting
   * @param key
   * @param value
   */
  public async setSetting(key: T, value: ISettings[T]) {
    this.throwIfNotInitialized();
    const setting = await this.repo.findOne({ where: { key } });
    setting!.value = value;
    const result = await this.repo.save(setting!);
    this.settings[key] = value;
    return result;
  }

  /**
   * Get the file storage for secrets
   */
  public getFileStorage(): FileStorage {
    return new DiskStorage('server-settings', false);
  }
}
