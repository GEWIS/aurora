import { defineStore } from 'pinia';
import {
  deleteSpotifyUser,
  getAllSpotifyUsers,
  getSpotifyProfile,
  spotifyLoginCallback,
  type SpotifyUserProfile,
  type SpotifyUserResponse,
  switchToSpotifyUser,
} from '@/api';

interface SpotifyStore {
  loading: boolean;
  spotifyUsers: SpotifyUserResponse[];
  currentSpotifyProfile: SpotifyUserProfile | undefined;
}

export const useSpotifyStore = defineStore('spotify', {
  state: (): SpotifyStore => ({
    loading: true,
    spotifyUsers: [],
    currentSpotifyProfile: undefined,
  }),
  actions: {
    async init() {
      const res = await getAllSpotifyUsers();
      if (res.response.ok && res.data) {
        this.spotifyUsers = res.data;
      }
      await this.fetchCurrentSpotifyProfile();
      this.loading = false;
    },
    async fetchCurrentSpotifyProfile() {
      const res = await getSpotifyProfile();
      if (res.response.ok && res.data) {
        this.currentSpotifyProfile = res.data;
      }
    },
    async deleteSpotifyUser(id: number) {
      const res = await deleteSpotifyUser({ path: { id } });
      if (res.response.ok) {
        const index = this.spotifyUsers.findIndex((u) => u.id === id);
        if (index >= 0) {
          this.spotifyUsers.splice(index, 1);
        }
      }
    },
    async loginCallback(state: string, code?: string, error?: string) {
      const res = await spotifyLoginCallback({ query: { state, code, error } });
      if (!res.response.ok) {
        return {
          success: false,
          error: res.error,
        };
      } else {
        this.currentSpotifyProfile = res.data;
        return {
          success: true,
          error: '',
        };
      }
    },
    async makeUserActive(spotifyUser: SpotifyUserResponse) {
      if (spotifyUser.spotifyId === this.currentSpotifyProfile?.id) {
        // User already active
        return;
      }

      const res = await switchToSpotifyUser({ path: { id: spotifyUser.id } });
      if (res.response.ok) {
        this.spotifyUsers.forEach((u) => {
          u.active = false;
        });
        const index = this.spotifyUsers.findIndex((u) => u.id === spotifyUser.id);
        if (index >= 0) {
          this.spotifyUsers[index].active = true;
        }
        await this.fetchCurrentSpotifyProfile();
      }
    },
  },
});
