import { defineStore } from 'pinia';
import { useSocketStore } from '@/stores/socket.store';
import { getSpotifyCurrentlyPlaying, type TrackChangeEvent } from '@/api';

interface CurrentlyPlayingStore {
  currentlyPlaying: TrackChangeEvent | null;
  initialized: boolean;
}

export const useCurrentlyPlayingStore = defineStore('currently-playing', {
  state: (): CurrentlyPlayingStore => ({
    currentlyPlaying: null,
    initialized: false,
  }),
  getters: {},
  actions: {
    handleChangeTrack(events?: TrackChangeEvent[]) {
      if (!events || events.length === 0) return;
      this.currentlyPlaying = events[0];
    },
    async init() {
      if (this.initialized) return;

      const store = useSocketStore();
      if (!store.backofficeSocket) return;

      store.backofficeSocket.on('change_track', this.handleChangeTrack.bind(this));

      const event = await getSpotifyCurrentlyPlaying();
      this.handleChangeTrack(event.data);
    },
    destroy() {
      const store = useSocketStore();
      if (!store.backofficeSocket) return;

      store.backofficeSocket.removeListener('beat', this.handleChangeTrack.bind(this));
    },
  },
});
