import { defineStore } from 'pinia';
import { getBorrelMode, setBorrelMode } from '@gewis/aurora-api-client';

interface BorrelModeStore {
  present: boolean;
  enabled: boolean;
  loading: boolean;
}

export const useBorrelModeStore = defineStore('borrel-mode', {
  state: (): BorrelModeStore => ({
    present: false,
    enabled: false,
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        const res = await getBorrelMode();
        if (res.data) {
          this.present = res.data.present;
          this.enabled = res.data.enabled;
        }
      } finally {
        this.loading = false;
      }
    },
    async set(enabled: boolean) {
      this.loading = true;
      try {
        const res = await setBorrelMode({ body: { enabled } });
        if (res.data) {
          this.present = res.data.present;
          this.enabled = res.data.enabled;
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
