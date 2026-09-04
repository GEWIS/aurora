import { defineStore } from 'pinia';
import {
  createInfoLayoutPreset,
  deleteInfoLayoutPreset,
  getInfoLayoutPresets,
  updateInfoLayoutPreset,
  type LayoutPresetParams,
  type LayoutPresetResponse,
} from '@gewis/aurora-api-client';

interface InfoLayoutPresetStore {
  presets: LayoutPresetResponse[];
  loading: boolean;
}

/** Named, reusable layout configurations (shared across all screens). */
export const useInfoLayoutPresetStore = defineStore('info-layout-preset', {
  state: (): InfoLayoutPresetStore => ({
    presets: [],
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      const res = await getInfoLayoutPresets();
      if (res.response.ok && res.data) this.presets = res.data;
      this.loading = false;
    },
    async create(params: LayoutPresetParams): Promise<LayoutPresetResponse | null> {
      const res = await createInfoLayoutPreset({ body: params });
      if (res.response.ok && res.data) {
        await this.fetch();
        return res.data;
      }
      return null;
    },
    async update(id: number, params: LayoutPresetParams): Promise<LayoutPresetResponse | null> {
      const res = await updateInfoLayoutPreset({ path: { id }, body: params });
      if (res.response.ok && res.data) {
        await this.fetch();
        return res.data;
      }
      return null;
    },
    async remove(id: number) {
      await deleteInfoLayoutPreset({ path: { id } });
      await this.fetch();
    },
  },
});
