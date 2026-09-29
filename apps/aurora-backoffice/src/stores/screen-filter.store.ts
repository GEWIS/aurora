import { defineStore } from 'pinia';
import {
  getScreenFilter,
  type ScreenFilterParams,
  type ScreenFilterState,
  setScreenFilter,
} from '@gewis/aurora-api-client';
import { useSocketStore } from '@/stores/socket.store';

export const DEFAULT_SCREEN_FILTER: ScreenFilterState = { brightness: 100, warmth: 0 };

interface ScreenFilterStore {
  filter: ScreenFilterState;
  loading: boolean;
  initialized: boolean;
}

export const useScreenFilterStore = defineStore('screen-filter', {
  state: (): ScreenFilterStore => ({
    filter: { ...DEFAULT_SCREEN_FILTER },
    loading: true,
    initialized: false,
  }),
  getters: {
    active: (state) =>
      state.filter.brightness !== DEFAULT_SCREEN_FILTER.brightness ||
      state.filter.warmth !== DEFAULT_SCREEN_FILTER.warmth,
  },
  actions: {
    async init() {
      // Already listening, but the filter may have changed while the feature was disabled
      if (this.initialized) return this.fetch();
      this.initialized = true;

      try {
        await this.fetch();
      } catch (e) {
        // Allow a later call to retry
        this.initialized = false;
        throw e;
      }
      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('screen_filter_update', () => {
        // Fails when the feature has just been disabled, which is fine
        this.fetch().catch(() => {});
      });
    },
    async fetch() {
      this.loading = true;
      try {
        const res = await getScreenFilter();
        if (res.data) this.filter = res.data;
      } finally {
        this.loading = false;
      }
    },
    async set(filter: ScreenFilterParams) {
      this.loading = true;
      try {
        const res = await setScreenFilter({ body: filter });
        if (res.data) this.filter = res.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
