import { defineStore } from 'pinia';
import {
  createInfoConferenceRoom,
  deleteInfoConferenceRoom,
  getInfoConferenceRoomConfigs,
  updateInfoConferenceRoom,
  type ConferenceRoomConfigResponse,
  type ConferenceRoomParams,
} from '@gewis/aurora-api-client';

interface ConferenceRoomStore {
  rooms: ConferenceRoomConfigResponse[];
  loading: boolean;
  initialized: boolean;
}

export const useConferenceRoomStore = defineStore('conference-room', {
  state: (): ConferenceRoomStore => ({
    rooms: [],
    loading: true,
    initialized: false,
  }),
  actions: {
    async init() {
      if (this.initialized) return;
      this.loading = true;
      await this.fetchRooms();
      this.loading = false;
      this.initialized = true;
    },
    async fetchRooms() {
      const res = await getInfoConferenceRoomConfigs();
      if (res.response.ok && res.data) this.rooms = res.data;
    },
    async createRoom(params: ConferenceRoomParams) {
      const res = await createInfoConferenceRoom({ body: params });
      if (res.response.ok && res.data) this.rooms.push(res.data);
    },
    async updateRoom(id: number, params: ConferenceRoomParams) {
      const res = await updateInfoConferenceRoom({ path: { id }, body: params });
      if (res.response.ok && res.data) {
        const index = this.rooms.findIndex((r) => r.id === id);
        if (index >= 0) this.rooms.splice(index, 1, res.data);
      }
    },
    async deleteRoom(id: number) {
      const res = await deleteInfoConferenceRoom({ path: { id } });
      if (res.response.ok) this.rooms = this.rooms.filter((r) => r.id !== id);
    },
  },
});
