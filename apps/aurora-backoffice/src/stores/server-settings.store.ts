import { defineStore } from 'pinia';
import { clearSettingsFile, type FeatureFlagResponse, type ISettings, setSetting, setSettingFile } from '@/api';
import { getFeatureFlags, getSettings } from '@/api';

interface ServerSettingsStore {
  serverSettings?: ISettings;
  featureFlags: FeatureFlagResponse;
  loading: boolean;
}

export const useServerSettingsStore = defineStore('server-settings', {
  state: (): ServerSettingsStore => ({
    serverSettings: undefined,
    featureFlags: [],
    loading: true,
  }),
  getters: {
    amountOfPosterScreenHandlers: (state) => {
      return state.featureFlags.filter((f) => f.key.includes('PosterScreenHandler') && f.value).length;
    },
  },
  actions: {
    async initFeatureFlags(): Promise<void> {
      const res = await getFeatureFlags();
      if (res && res.data) this.featureFlags = res.data;
      this.loading = false;
    },
    async initSettings(): Promise<void> {
      this.loading = true;
      const res = await getSettings();
      if (res && res.data) this.serverSettings = res.data;
      this.loading = false;
    },
    isFeatureFlag(setting: keyof ISettings): boolean {
      return this.featureFlags.some((f) => f.key === setting);
    },
    featureEnabled(setting: keyof ISettings): boolean {
      const match = this.featureFlags.find((f) => f.key === setting);
      if (!match) return true;
      return match.value;
    },
    async setSetting(setting: keyof ISettings, value: ISettings[keyof ISettings]): Promise<void> {
      if (!this.serverSettings) return;

      this.loading = true;
      await setSetting({ body: { key: setting, value } });
      this.serverSettings[setting] = value as never;
      this.loading = false;
    },
    async setSettingFile(setting: keyof ISettings, file: Blob): Promise<void> {
      if (!this.serverSettings) return;

      this.loading = true;
      const res = await setSettingFile({ body: { key: setting, file } });
      if (res.response.ok && res.data) {
        this.serverSettings[setting] = res.data.value as never;
      }
      this.loading = false;
    },
    async clearSettingFile(setting: keyof ISettings): Promise<void> {
      if (!this.serverSettings) return;

      this.loading = true;
      const res = await clearSettingsFile({ body: { key: setting } });
      if (res.response.ok && res.data) {
        this.serverSettings[setting] = res.data.value as never;
      }
      this.loading = false;
    },
  },
});
