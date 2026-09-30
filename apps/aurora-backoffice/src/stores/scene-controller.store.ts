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
      try {
        await this.fetchScenes();
      } finally {
        this.loading = false;
      }
    },
    async createScene(body: CreateSceneParams) {
      this.loading = true;
      try {
        await createScene({
          body: body,
          throwOnError: true,
        });
        await this.fetchScenes();
      } finally {
        this.loading = false;
      }
    },
    async updateScene(id: number, body: UpdateSceneParams) {
      this.loading = true;
      try {
        const { data: scene } = await updateScene({
          body: body,
          path: { id },
          throwOnError: true,
        });
        if (scene && this.activeSceneId === id) {
          await useHandlersStore().setLightsHandler(getSceneLightsGroupIds(scene), 'ScenesHandler');
        }
        await this.fetchScenes();
      } finally {
        this.loading = false;
      }
    },
    async deleteScene(id: number) {
      this.loading = true;
      try {
        await deleteScene({
          path: { id },
        });
        await this.fetchScenes();
      } finally {
        this.loading = false;
      }
    },
    async applyScene(scene: LightsSceneResponse) {
      this.loading = true;
      try {
        await useHandlersStore().setLightsHandler(getSceneLightsGroupIds(scene), 'ScenesHandler');
        await applyScene({
          path: { id: scene.id },
        });
        this.activeSceneId = scene.id;
      } finally {
        this.loading = false;
      }
    },
    async clearScene() {
      this.loading = true;
      try {
        await clearScene();
        this.activeSceneId = null;
      } finally {
        this.loading = false;
      }
    },
  },
});
