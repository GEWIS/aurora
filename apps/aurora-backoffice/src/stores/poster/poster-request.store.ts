import { defineStore } from 'pinia';
import {
  approvePosterRequest,
  type ApprovePosterRequestParams,
  denyPosterRequest,
  getAllPosterRequests,
  getPosterRequestMedia,
  type PosterRequestResponse,
} from '@gewis/aurora-api-client';
import { useSocketStore } from '@/stores/socket.store';
import { usePosterStore } from '@/stores/poster/poster.store';

interface PosterRequestStore {
  requests: PosterRequestResponse[];
  loading: boolean;
  initialized: boolean;
}

export const usePosterRequestStore = defineStore('poster-request', {
  state: (): PosterRequestStore => ({
    requests: [],
    loading: true,
    initialized: false,
  }),
  getters: {
    count: (state) => state.requests.length,
  },
  actions: {
    /**
     * Initialize the store and keep it up to date when requests are added or handled elsewhere.
     */
    async init() {
      if (this.initialized) return;

      await this.fetchRequests();
      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('poster_request_update', this.fetchRequests.bind(this));

      this.initialized = true;
    },
    /**
     * Load all pending poster requests from the server.
     */
    async fetchRequests() {
      const res = await getAllPosterRequests();
      if (res.response?.ok && res.data) {
        this.requests = res.data;
      }
      this.loading = false;
    },
    /**
     * Fetch the uploaded file of a request. The file is private, so it cannot be linked directly.
     * @param id
     */
    async fetchMedia(id: number): Promise<Blob | undefined> {
      const res = await getPosterRequestMedia({ path: { id }, parseAs: 'blob' });
      // The endpoint writes the file itself, so the generated client types the body as void
      const data: unknown = res.data;
      return res.response?.ok && data instanceof Blob ? data : undefined;
    },
    /**
     * Approve the given request with the reviewed poster fields.
     * @param id
     * @param params
     * @returns whether the request was approved
     */
    async approve(id: number, params: ApprovePosterRequestParams): Promise<boolean> {
      const res = await approvePosterRequest({ path: { id }, body: params });
      if (!res.response?.ok || !res.data) return false;

      this.removeLocally(id);
      const posterStore = usePosterStore();
      if (posterStore.initialized) posterStore.posters.push(res.data);
      return true;
    },
    /**
     * Deny the given request.
     * @param id
     * @returns whether the request was denied
     */
    async deny(id: number): Promise<boolean> {
      const res = await denyPosterRequest({ path: { id } });
      if (!res.response?.ok) return false;

      this.removeLocally(id);
      return true;
    },
    /**
     * Remove a handled request from the local list.
     * @param id
     */
    removeLocally(id: number) {
      this.requests = this.requests.filter((r) => r.id !== id);
    },
  },
});
