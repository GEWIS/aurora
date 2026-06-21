import { defineStore } from 'pinia';
import { useSocketStore } from '@/stores/socket.store';
import {
  type AudioResponse,
  getAudioHandlers,
  getLightsHandlers,
  getScreenHandlers,
  type HandlerResponseAudioResponse,
  type HandlerResponseLightsGroupResponse,
  type HandlerResponseScreenResponse,
  type LightsGroupResponse,
  resetAllHandlersToDefaults,
  type ScreenResponse,
  setAudioHandler,
  setLightsHandler,
  setScreenHandler,
} from '@/api';

type Handler = HandlerResponseAudioResponse | HandlerResponseLightsGroupResponse | HandlerResponseScreenResponse;

/**
 * HandlerStore
 * @param audioHandlers - The audio handlers
 * @param lightsHandlers - The lights handlers
 * @param screenHandlers - The screen handlers
 * @param gettingAudio - Whether getting the audio handlers
 * @param settingAudio - Whether setting the audio handler
 * @param gettingScreens - Whether getting the screen handlers
 * @param settingScreens - Whether setting the screen handler
 * @param gettingLights - Whether getting the lights handlers
 * @param settingLights - Whether setting the lights handler
 */
interface HandlersStore {
  audioHandlers: HandlerResponseAudioResponse[];
  lightsHandlers: HandlerResponseLightsGroupResponse[];
  screenHandlers: HandlerResponseScreenResponse[];
  gettingAudio: boolean;
  settingAudio: boolean;
  gettingScreens: boolean;
  settingScreens: boolean;
  gettingLights: boolean;
  settingLights: boolean;
}

export const useHandlersStore = defineStore('handlers', {
  state: (): HandlersStore =>
    ({
      audioHandlers: [],
      lightsHandlers: [],
      screenHandlers: [],
      gettingAudio: false,
      settingAudio: false,
      gettingScreens: false,
      settingScreens: false,
      gettingLights: false,
      settingLights: false,
    }) as HandlersStore,
  getters: {
    fetchAudioHandlers: (state) => state.audioHandlers,
    fetchLightsHandlers: (state) => state.lightsHandlers,
    fetchScreenHandlers: (state) => state.screenHandlers,
    isGettingAudio: (state) => state.gettingAudio,
    isSettingAudio: (state) => state.settingAudio,
    isGettingScreens: (state) => state.gettingScreens,
    isSettingScreens: (state) => state.settingScreens,
    isGettingLights: (state) => state.gettingLights,
    isSettingLights: (state) => state.settingLights,
  },
  actions: {
    /**
     * Get the audio handlers
     * In case error while fetching; set undefined
     */
    async getAudioHandlers() {
      this.gettingAudio = true;
      await getAudioHandlers()
        .then((handlers) => (this.audioHandlers = handlers.data!))
        .catch(() => (this.audioHandlers = []));
      this.gettingAudio = false;
    },
    /**
     * Get the light handlers
     * In case error while fetching; set undefined
     */
    async getLightsHandlers() {
      this.gettingLights = true;
      await getLightsHandlers()
        .then((handlers) => (this.lightsHandlers = handlers.data!))
        .catch(() => (this.lightsHandlers = []));
      this.gettingLights = false;
    },
    /**
     * Get the screen handlers
     * In case error while fetching; set undefined
     */
    async getScreenHandlers() {
      this.gettingScreens = true;
      await getScreenHandlers()
        .then((handlers) => (this.screenHandlers = handlers.data!))
        .catch(() => (this.screenHandlers = []));
      this.gettingScreens = false;
    },
    /**
     * Initialize the store
     */
    async init(): Promise<void> {
      this.gettingAudio = this.gettingScreens = this.gettingLights = true;
      await this.getAudioHandlers();
      await this.getLightsHandlers();
      await this.getScreenHandlers();

      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('handler_audio_update', this.getAudioHandlers.bind(this));
      socketStore.backofficeSocket?.on('handler_screen_update', this.getScreenHandlers.bind(this));
      socketStore.backofficeSocket?.on('handler_lightsgroup_update', this.getLightsHandlers.bind(this));

      this.gettingAudio = this.gettingScreens = this.gettingLights = false;
    },
    /**
     * Set the audio handler
     * @param id - id of the audio
     * @param newHandler - new handler
     */
    async setAudioHandler(id: number | number[], newHandler: string | null = null): Promise<void> {
      this.settingAudio = true;
      if (Array.isArray(id)) {
        await Promise.all(
          id.map(
            async (i) =>
              await setAudioHandler({
                body: { name: newHandler != null ? newHandler : '' },
                path: { id: i },
              }),
          ),
        );
      } else {
        await setAudioHandler({
          body: { name: newHandler != null ? newHandler : '' },
          path: { id },
        });
      }
      this.settingAudio = false;

      await this.getAudioHandlers();
    },
    /**
     * Set the lights handler
     * @param id - id of the lights group
     * @param newHandler - new handler
     */
    async setLightsHandler(id: number | number[], newHandler: string | null = null): Promise<void> {
      this.settingLights = true;
      if (Array.isArray(id)) {
        await Promise.all(
          id.map((i) =>
            setLightsHandler({
              body: { name: newHandler != null ? newHandler : '' },
              path: { id: i },
            }),
          ),
        );
      } else {
        await setLightsHandler({
          body: { name: newHandler != null ? newHandler : '' },
          path: { id },
        });
      }
      this.settingLights = false;

      await this.getLightsHandlers();
    },
    /**
     * Set the screen handler
     * @param id - id of the screen
     * @param newHandler - new handler
     */
    async setScreenHandler(id: number | number[], newHandler: string | null = null): Promise<void> {
      this.settingScreens = true;
      if (Array.isArray(id)) {
        await Promise.all(
          id.map((i) =>
            setScreenHandler({
              body: { name: newHandler != null ? newHandler : '' },
              path: { id: i },
            }),
          ),
        );
      } else {
        await setScreenHandler({
          body: { name: newHandler != null ? newHandler : '' },
          path: { id },
        });
      }

      this.settingScreens = false;
      await this.getScreenHandlers();
    },
    /**
     * Get the registered audios
     * @param handlerName
     */
    getRegisteredAudios(handlerName?: string): AudioResponse[] {
      if (!handlerName) return this.audioHandlers.map((h) => h.entities).flat();
      const handler = this.audioHandlers.find((h) => h.name === handlerName);
      if (!handler) return [];
      return handler.entities;
    },
    /**
     * Get the registered lights
     * @param handlerName
     */
    getRegisteredLights(handlerName?: string): LightsGroupResponse[] {
      if (!handlerName) return this.lightsHandlers.map((h) => h.entities).flat();
      const handler = this.lightsHandlers.find((h) => h.name === handlerName);
      if (!handler) return [];
      return handler.entities;
    },
    /**
     * Get the registered screens
     * @param handlerName
     */
    getRegisteredScreens(handlerName?: string): ScreenResponse[] {
      if (!handlerName) return this.screenHandlers.map((h) => h.entities).flat();
      const handler = this.screenHandlers.find((h) => h.name === handlerName);
      if (!handler) return [];
      return handler.entities;
    },
    /**
     * Reset the store
     */
    async reset() {
      this.gettingAudio = this.gettingScreens = this.gettingLights = true;
      await resetAllHandlersToDefaults();
      await this.getAudioHandlers();
      await this.getLightsHandlers();
      await this.getScreenHandlers();
      this.gettingAudio = this.gettingScreens = this.gettingLights = false;
    },
  },
});

export { type Handler };
