import { defineStore } from 'pinia';
import { getAllLightsColors, type LightsColorResponse, type RgbColor } from '@/api';

interface ColorStore {
  colors: LightsColorResponse[];
}

export const useColorStore = defineStore('color', {
  state: (): ColorStore => ({
    colors: [],
  }),
  actions: {
    async init(): Promise<void> {
      await getAllLightsColors().then((colors) => (this.colors = colors.data!));
    },
    getHexColor(c: RgbColor): string {
      const color = this.colors.find((c1) => c1.color === c);
      if (!color) return '';
      return color.spec.hex;
    },
  },
});
