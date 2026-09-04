import { defineStore } from 'pinia';
import {
  createInfoNewsSource,
  deleteInfoNewsSource,
  getInfoNewsSources,
  updateInfoNewsSource,
  type NewsSourceParams,
  type NewsSourceResponse,
} from '@gewis/aurora-api-client';

interface NewsSourceStore {
  sources: NewsSourceResponse[];
  loading: boolean;
  initialized: boolean;
}

export const useNewsSourceStore = defineStore('news-source', {
  state: (): NewsSourceStore => ({
    sources: [],
    loading: true,
    initialized: false,
  }),
  actions: {
    async init() {
      if (this.initialized) return;
      this.loading = true;
      await this.fetchSources();
      this.loading = false;
      this.initialized = true;
    },
    async fetchSources() {
      const res = await getInfoNewsSources();
      if (res.response.ok && res.data) this.sources = res.data;
    },
    async createSource(params: NewsSourceParams) {
      const res = await createInfoNewsSource({ body: params });
      if (res.response.ok && res.data) this.sources.push(res.data);
    },
    async updateSource(id: number, params: NewsSourceParams) {
      const res = await updateInfoNewsSource({ path: { id }, body: params });
      if (res.response.ok && res.data) {
        const index = this.sources.findIndex((s) => s.id === id);
        if (index >= 0) this.sources.splice(index, 1, res.data);
      }
    },
    async deleteSource(id: number) {
      const res = await deleteInfoNewsSource({ path: { id } });
      if (res.response.ok) this.sources = this.sources.filter((s) => s.id !== id);
    },
  },
});
