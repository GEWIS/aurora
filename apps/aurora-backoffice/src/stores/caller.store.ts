import { defineStore } from 'pinia';
import {
  createInfoCaller,
  deleteInfoCaller,
  getInfoCallers,
  testInfoCallerRing,
  updateInfoCaller,
  type CallerParams,
  type CallerResponse,
} from '@gewis/aurora-api-client';

interface CallerStore {
  callers: CallerResponse[];
  loading: boolean;
  initialized: boolean;
}

export const useCallerStore = defineStore('caller', {
  state: (): CallerStore => ({
    callers: [],
    loading: true,
    initialized: false,
  }),
  actions: {
    async init() {
      if (this.initialized) return;
      this.loading = true;
      await this.fetchCallers();
      this.loading = false;
      this.initialized = true;
    },
    async fetchCallers() {
      const res = await getInfoCallers();
      if (res.response.ok && res.data) this.callers = res.data;
    },
    async createCaller(params: CallerParams) {
      const res = await createInfoCaller({ body: params });
      if (res.response.ok && res.data) this.callers.push(res.data);
    },
    async updateCaller(id: number, params: CallerParams) {
      const res = await updateInfoCaller({ path: { id }, body: params });
      if (res.response.ok && res.data) {
        const index = this.callers.findIndex((c) => c.id === id);
        if (index >= 0) this.callers.splice(index, 1, res.data);
      }
    },
    async deleteCaller(id: number) {
      const res = await deleteInfoCaller({ path: { id } });
      if (res.response.ok) this.callers = this.callers.filter((c) => c.id !== id);
    },
    /** Trigger a test incoming-call overlay on the screens. */
    async testCall(number: string) {
      await testInfoCallerRing({ body: { number } });
    },
  },
});
