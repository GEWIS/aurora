import { defineStore } from 'pinia';
import {
  createInfoKeyholder,
  deleteInfoKeyholder,
  deleteInfoPc,
  getInfoKeyholders,
  getInfoKeyholderSyncStatus,
  getInfoPcUsage,
  getInfoRoomStatus,
  type KeyholderParams,
  type KeyholderResponse,
  type KeyholderSyncResult,
  type KeyholderSyncStatus,
  type PcOverride,
  type PcStatusResponse,
  revertInfoKeyholder,
  type RoomStatusParams,
  type RoomStatusResponse,
  setInfoPcOverride,
  setInfoRoomStatus,
  syncInfoKeyholders,
  updateInfoKeyholder,
} from '@gewis/aurora-api-client';

interface InfoStore {
  keyholders: KeyholderResponse[];
  roomStatus: RoomStatusResponse | null;
  pcs: PcStatusResponse[];
  /** Whether this server can sync keyholders from LDAP at all. */
  keyholderSync: KeyholderSyncStatus | null;
  loading: boolean;
  initialized: boolean;
}

export const useInfoStore = defineStore('info', {
  state: (): InfoStore => ({
    keyholders: [],
    roomStatus: null,
    pcs: [],
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
        this.fetchPcUsage(),
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
     * Run the LDAP sync now and reload the registry. Returns what changed, or
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
    async fetchPcUsage() {
      // Include disabled PCs so they can be re-enabled from the backoffice.
      const res = await getInfoPcUsage({ query: { includeDisabled: true } });
      if (res.response.ok && res.data) this.pcs = res.data;
    },
    async setPcOverride(pcId: string, override: PcOverride) {
      const res = await setInfoPcOverride({ path: { pcId }, body: { override } });
      if (res.response.ok) await this.fetchPcUsage();
    },
    async deletePc(pcId: string) {
      const res = await deleteInfoPc({ path: { pcId } });
      if (res.response.ok) await this.fetchPcUsage();
    },
    async createKeyholder(params: KeyholderParams) {
      const res = await createInfoKeyholder({ body: params });
      if (res.response.ok && res.data) this.keyholders.push(res.data);
    },
    async updateKeyholder(id: number, params: KeyholderParams) {
      const res = await updateInfoKeyholder({ path: { id }, body: params });
      if (res.response.ok && res.data) {
        const index = this.keyholders.findIndex((k) => k.id === id);
        if (index >= 0) this.keyholders.splice(index, 1, res.data);
      }
    },
    /** Restore an LDAP-managed keyholder's name to the directory's value. */
    async revertKeyholder(id: number) {
      const res = await revertInfoKeyholder({ path: { id } });
      if (res.response.ok && res.data) {
        const index = this.keyholders.findIndex((k) => k.id === id);
        if (index >= 0) this.keyholders.splice(index, 1, res.data);
      }
    },
    async deleteKeyholder(id: number) {
      const res = await deleteInfoKeyholder({ path: { id } });
      if (res.response.ok) this.keyholders = this.keyholders.filter((k) => k.id !== id);
    },
    async saveRoomStatus(params: RoomStatusParams) {
      const res = await setInfoRoomStatus({ body: params });
      if (res.response.ok && res.data) this.roomStatus = res.data;
    },
  },
});
