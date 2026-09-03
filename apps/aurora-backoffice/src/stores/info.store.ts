import { defineStore } from 'pinia';
import {
  getInfoKeyholders,
  getInfoKeyholderSyncStatus,
  getInfoRoomStatus,
  type KeyholderParams,
  type KeyholderResponse,
  type KeyholderSyncResult,
  type KeyholderSyncStatus,
  type RoomStatusParams,
  type RoomStatusResponse,
  setInfoRoomStatus,
  syncInfoKeyholders,
  updateInfoKeyholder,
} from '@gewis/aurora-api-client';

interface InfoStore {
  keyholders: KeyholderResponse[];
  roomStatus: RoomStatusResponse | null;
  /** Whether this server can sync keyholders from the GEWIS API at all. */
  keyholderSync: KeyholderSyncStatus | null;
  loading: boolean;
  initialized: boolean;
}

export const useInfoStore = defineStore('info', {
  state: (): InfoStore => ({
    keyholders: [],
    roomStatus: null,
    keyholderSync: null,
    loading: true,
    initialized: false,
  }),
  actions: {
    async init() {
      if (this.initialized) return;
      this.loading = true;
      await Promise.all([
        this.fetchKeyholders(),
        this.fetchRoomStatus(),
        this.fetchKeyholderSyncStatus(),
      ]);
      this.loading = false;
      this.initialized = true;
    },
    async fetchKeyholders() {
      const res = await getInfoKeyholders();
      if (res.response.ok && res.data) this.keyholders = res.data;
    },
    async fetchKeyholderSyncStatus() {
      const res = await getInfoKeyholderSyncStatus();
      if (res.response.ok && res.data) this.keyholderSync = res.data;
    },
    /**
     * Run the GEWIS sync now and reload the registry. Returns what changed, or
     * null when the sync could not run.
     */
    async syncKeyholders(): Promise<KeyholderSyncResult | null> {
      const res = await syncInfoKeyholders();
      if (!res.response.ok || !res.data) return null;
      await this.fetchKeyholders();
      return res.data;
    },
    async fetchRoomStatus() {
      const res = await getInfoRoomStatus();
      if (res.response.ok && res.data) this.roomStatus = res.data;
    },
    async updateKeyholder(id: number, params: KeyholderParams) {
      const res = await updateInfoKeyholder({ path: { id }, body: params });
      if (res.response.ok && res.data) {
        const index = this.keyholders.findIndex((k) => k.id === id);
        if (index >= 0) this.keyholders.splice(index, 1, res.data);
      }
    },
    async saveRoomStatus(params: RoomStatusParams) {
      const res = await setInfoRoomStatus({ body: params });
      if (res.response.ok && res.data) this.roomStatus = res.data;
    },
  },
});
