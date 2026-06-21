import { defineStore } from 'pinia';

import { useSocketStore } from '@/stores/socket.store';
import {
  type AudioResponse,
  getAudios,
  getLightsGroups,
  getScreens,
  getSingleLightsGroup,
  type LightsGroupResponse,
  type ScreenResponse,
} from '@/api';

interface SubscriberStore {
  audios: AudioResponse[];
  screens: ScreenResponse[];
  lightsGroups: LightsGroupResponse[];
}

export const useSubscriberStore = defineStore('subscribers', {
  state: (): SubscriberStore => ({
    audios: [],
    screens: [],
    lightsGroups: [],
  }),
  getters: {},
  actions: {
    async getAudios() {
      await getAudios().then((audios) => (this.audios = audios.data!));
    },
    async getScreens() {
      await getScreens().then((screens) => (this.screens = screens.data!));
    },
    async getLightGroups() {
      await getLightsGroups().then((lightsGroups) => (this.lightsGroups = lightsGroups.data!));
    },
    async updateLightsGroupInStore(id: number) {
      const res = await getSingleLightsGroup({ path: { id } });
      if (!res.response.ok || !res.data) {
        return;
      }

      const updatedLightsGroup = res.data;
      const index = this.lightsGroups.findIndex((g) => g.id === updatedLightsGroup.id);
      if (index >= 0) {
        this.lightsGroups.splice(index, 1, updatedLightsGroup);
      } else {
        this.lightsGroups.push(updatedLightsGroup);
      }
    },
    async init(): Promise<void> {
      await Promise.all([this.getAudios(), this.getScreens(), this.getLightGroups()]);

      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('connect_audio', this.getAudios.bind(this));
      socketStore.backofficeSocket?.on('connect_screen', this.getScreens.bind(this));
      socketStore.backofficeSocket?.on('connect_lightsgroup', this.getLightGroups.bind(this));
    },
  },
});
