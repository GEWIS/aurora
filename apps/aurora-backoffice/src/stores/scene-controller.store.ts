import { defineStore } from 'pinia';
import {
  type CreateSceneParams,
  type LightsSceneResponse,
  getAllScenes,
  createScene,
  deleteScene,
  applyScene,
  clearScene,
} from '@/api';

interface SceneControllerStore {
  scenes: LightsSceneResponse[];
  favoriteScenes: LightsSceneResponse[];
  loading: boolean;
}

export const useSceneControllerStore = defineStore('scene-controller', {
  state: (): SceneControllerStore => ({
    scenes: [],
    favoriteScenes: [],
    loading: true,
  }),
  getters: {},
  actions: {
    async init() {
      const scenes = await getAllScenes({
        query: { favorite: true },
      });
      this.favoriteScenes = scenes.data!;
      this.loading = false;
    },
    async fetchScenes() {
      const scenes = await getAllScenes();
      this.scenes = scenes.data!;
      this.favoriteScenes = scenes.data!.filter((s) => s.favorite);
    },
    async initPage() {
      this.loading = true;
      await this.fetchScenes();
      this.loading = false;
    },
    async createScene(body: CreateSceneParams) {
      this.loading = true;
      await createScene({
        body: body,
      });
      await this.fetchScenes();
      this.loading = false;
    },
    async deleteScene(id: number) {
      this.loading = true;
      await deleteScene({
        path: { id },
      });
      await this.fetchScenes();
      this.loading = false;
    },
    async applyScene(id: number) {
      this.loading = true;
      await applyScene({
        path: { id },
      });
      this.loading = false;
    },
    async clearScene() {
      this.loading = true;
      await clearScene();
      this.loading = false;
    },
  },
});
