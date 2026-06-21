import { defineStore } from 'pinia';

import { useSocketStore } from '@/stores/socket.store';

export interface Status {
  uptimeSeconds: number;
  coreTimestamp: number;
  systemTimestamp: number;
  latencyMilliseconds: number;
}

interface StatusStore {
  audioStatus: Map<number, Status>;
  screenStatus: Map<number, Status>;
  lightControllerStatus: Map<number, Status>;
}

export const useStatusStore = defineStore('status', {
  state: (): StatusStore => ({
    audioStatus: new Map(),
    screenStatus: new Map(),
    lightControllerStatus: new Map(),
  }),
  getters: {},
  actions: {
    init() {
      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('status:updated', (payload) => {
        switch (payload.type) {
          case 'audio':
            this.audioStatus.set(payload.id, payload.status);
            break;
          case 'screen':
            this.screenStatus.set(payload.id, payload.status);
            break;
          case 'lights_controller':
            this.lightControllerStatus.set(payload.id, payload.status);
            break;
        }
      });
    },
  },
});
