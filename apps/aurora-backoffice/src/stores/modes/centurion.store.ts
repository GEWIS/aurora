import { defineStore } from 'pinia';
import { useSocketStore } from '@/stores/socket.store';
import {
  type MixTapeResponse,
  type CenturionResponse,
  type HttpApiException,
  getCenturion,
  getCenturionTapes,
  enableCenturion,
  disableCenturion,
  startCenturion,
  stopCenturion,
  skipCenturion,
} from '@/api';

/**
 * Centurion store
 * @param currentTape - The current loaded centurion tape
 * @param tapes - The available centurion tapes
 * @param loading - Whether the centurion is loading
 * @param playing - Whether the centurion is playing
 * @param skipping - Whether the centurion is skipping
 */
interface CenturionStore {
  currentTape: CenturionResponse | null;
  loading: boolean;
  tapes: MixTapeResponse[] | null;
  playing: boolean;
  skipping: boolean;
}

export const useCenturionStore = defineStore('centurion', {
  state: (): CenturionStore => ({
    currentTape: null,
    tapes: null,
    loading: true,
    playing: false,
    skipping: false,
  }),
  getters: {
    enabled(): boolean {
      return this.currentTape != null && !this.loading;
    },
    disabled(): boolean {
      return this.currentTape == null && !this.loading;
    },
    getCurrentTape: (state) => state.currentTape,
    getTapes: (state) => state.tapes,
    isLoading: (state) => state.loading,
    isPlaying: (state) => state.playing,
    isSkipping: (state) => state.skipping,
  },
  actions: {
    /**
     * Get the current centurion tape
     * @param handleLoading - whether to enable and disable loading
     */
    async getCurrentCenturion(handleLoading = true) {
      if (handleLoading) this.loading = true;
      await getCenturion()
        .then((tape) => (this.currentTape = tape.data!))
        .catch((e: HttpApiException | string) => {
          if ((typeof e !== 'string' && e.statusCode === 404) || e === 'Centurion not enabled') {
            this.currentTape = null;
          }
        });
      if (handleLoading) this.loading = false;
    },
    /**
     * Initialize the store
     */
    async init() {
      await getCenturionTapes().then((tapes) => (this.tapes = tapes.data!));

      await this.getCurrentCenturion(false);
      this.loading = false;
      this.playing = this.currentTape?.playing ?? false;

      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('mode_centurion_update', this.getCurrentCenturion.bind(this));
    },
    /**
     * Destroy the store
     */
    destroy() {
      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.removeListener('mode_centurion_update', this.getCurrentCenturion.bind(this));
    },
    /**
     * Initialize the centurion
     * @param tapeName - The name of the centurion tape
     * @param tapeArtist
     * @param audioIds - The audio ids to use
     * @param screenIds - The screen ids to use
     * @param lightsGroupIds - The lights group ids to use
     */
    async initializeCenturion(
      tapeName: string,
      tapeArtist: string,
      audioIds: number[],
      screenIds: number[],
      lightsGroupIds: number[],
    ) {
      this.loading = true;

      await enableCenturion({
        body: {
          centurionName: tapeName,
          centurionArtist: tapeArtist,
          audioIds: audioIds,
          screenIds: screenIds,
          lightsGroupIds: lightsGroupIds,
        },
      });
      await this.getCurrentCenturion(false);
      this.loading = false;
      this.playing = false;
    },
    /**
     * Quit the centurion
     */
    async quitCenturion() {
      this.loading = true;
      await disableCenturion();
      this.currentTape = null;
      this.loading = false;
    },
    /**
     * Start the centurion
     */
    async startCenturion() {
      await startCenturion();
      this.playing = true;
    },
    /**
     * Pause the centurion
     */
    async pauseCenturion() {
      await stopCenturion();
      this.playing = false;
    },
    /**
     * Skip the centurion
     * @param seconds - The number of seconds to skip
     */
    async skipCenturion(seconds: number) {
      this.skipping = true;
      await skipCenturion({
        body: {
          seconds: seconds,
        },
      });
      this.skipping = false;
    },
  },
});
