import { defineStore } from 'pinia';
import {
  type CreateSceneParams,
  type LightsSceneResponse,
  type UpdateSceneParams,
  getAllScenes,
  getActiveScene,
  createScene,
  updateScene,
  deleteScene,
  applyScene,
  clearScene,
} from '@gewis/aurora-api-client';
import { useHandlersStore } from '@/stores/handlers.store';

interface SceneControllerStore {
  scenes: LightsSceneResponse[];
  favoriteScenes: LightsSceneResponse[];
  activeSceneId: number | null;
  loading: boolean;
}

/**
 * Get the unique IDs of all lights groups the given scene has effects for
 */
function getSceneLightsGroupIds(scene: LightsSceneResponse): number[] {
  return scene.effects
    .map((e) => e.lightsGroups.map((g) => g.id))
    .flat()
    .filter((n1, index, all) => index === all.findIndex((n2) => n1 === n2));
}

export const useSceneControllerStore = defineStore('scene-controller', {
  state: (): SceneControllerStore => ({
    scenes: [],
    favoriteScenes: [],
    activeSceneId: null,
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
      const [scenes, activeScene] = await Promise.all([getAllScenes(), getActiveScene()]);
      this.scenes = scenes.data!;
      this.favoriteScenes = scenes.data!.filter((s) => s.favorite);
      this.activeSceneId = activeScene.data?.scene?.id ?? null;
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
    async updateScene(id: number, body: UpdateSceneParams) {
      this.loading = true;
      const { data: scene } = await updateScene({
        body: body,
        path: { id },
      });
      // The server reapplies an active scene, but only to groups that already use the
      // ScenesHandler, so move any newly added groups to it as well
      if (scene && this.activeSceneId === id) {
        await useHandlersStore().setLightsHandler(getSceneLightsGroupIds(scene), 'ScenesHandler');
      }
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
    async applyScene(scene: LightsSceneResponse) {
      this.loading = true;
      await useHandlersStore().setLightsHandler(getSceneLightsGroupIds(scene), 'ScenesHandler');
      await applyScene({
        path: { id: scene.id },
      });
      this.activeSceneId = scene.id;
      this.loading = false;
    },
    async clearScene() {
      this.loading = true;
      await clearScene();
      this.activeSceneId = null;
      this.loading = false;
    },
  },
});
