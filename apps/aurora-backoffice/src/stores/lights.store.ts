import { defineStore } from 'pinia';
import { clearLightsGroupMasterDimmer, setLightsGroupMasterDimmer } from '@/api';
import { useSubscriberStore } from '@/stores/subscriber.store';

interface LightsStore {
  brightnessLoading: boolean;
}

export const useLightsStore = defineStore('lights', {
  state: (): LightsStore => ({
    brightnessLoading: false,
  }),
  actions: {
    async setLightsGroupBrightness(id: number, relativeBrightness: number) {
      this.brightnessLoading = true;
      const res = await setLightsGroupMasterDimmer({ path: { id }, body: { relativeBrightness } });
      if (res.response.ok) {
        await useSubscriberStore().updateLightsGroupInStore(id);
      }
      this.brightnessLoading = false;
    },
    async resetLightsGroupBrightness(id: number) {
      this.brightnessLoading = true;
      const res = await clearLightsGroupMasterDimmer({ path: { id } });
      if (res.response.ok) {
        await useSubscriberStore().updateLightsGroupInStore(id);
      }
      this.brightnessLoading = false;
    },
  },
});
