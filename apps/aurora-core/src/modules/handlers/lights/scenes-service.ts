import { EntityManager, Repository } from 'typeorm';
import { LightsScene, LightsSceneEffect } from '../../lights/entities/scenes';
import { getDataSource } from '../../../database';
import RootLightsService, { BaseLightsGroupResponse } from '../../lights/root-lights-service';
import { LightsEffectsColorCreateParams } from '../../lights/effects/color';
import { LightsEffectsMovementCreateParams } from '../../lights/effects/movement';

export type LightsSceneEffectResponse = {
  lightsGroups: BaseLightsGroupResponse[];
} & (LightsEffectsColorCreateParams | LightsEffectsMovementCreateParams);

export interface LightsSceneResponse {
  id: number;
  name: string;
  favorite: boolean;
  effects: LightsSceneEffectResponse[];
}

export interface ActiveSceneResponse {
  scene: LightsSceneResponse | null;
}

export type LightsSceneEffectParams = {
  lightsGroups: number[];
} & (LightsEffectsColorCreateParams | LightsEffectsMovementCreateParams);

export interface CreateSceneParams {
  name: string;
  favorite: boolean;
  effects: LightsSceneEffectParams[];
}

export type UpdateSceneParams = CreateSceneParams;

export interface GetLightsSceneOptions {
  favorite?: boolean;
}

export default class ScenesService {
  private repository: Repository<LightsScene>;

  constructor() {
    this.repository = getDataSource().getRepository(LightsScene);
  }

  public static toSceneResponse(scene: LightsScene): LightsSceneResponse {
    // Every database row is a single (effect, props, group) combination. Merge rows
    // with the exact same effect and props, so the response mirrors CreateSceneParams
    const effectsMap: Map<string, LightsSceneEffectResponse> = new Map();
    scene.effects.forEach((e) => {
      const key = `${e.effectName}\0${e.effectProps}`;
      const group: BaseLightsGroupResponse = {
        id: e.group.id,
        createdAt: e.group.createdAt,
        updatedAt: e.group.updatedAt,
        name: e.group.name,
      };

      const existing = effectsMap.get(key);
      if (existing) {
        existing.lightsGroups.push(group);
      } else {
        effectsMap.set(key, {
          type: e.effectName,
          props: JSON.parse(e.effectProps),
          lightsGroups: [group],
        } as LightsSceneEffectResponse);
      }
    });

    return {
      id: scene.id,
      name: scene.name,
      favorite: scene.favorite,
      effects: Array.from(effectsMap.values()),
    };
  }

  private static async saveEffects(
    manager: EntityManager,
    sceneId: number,
    effects: LightsSceneEffectParams[],
  ): Promise<void> {
    const sceneEffectRepo = manager.getRepository(LightsSceneEffect);
    await Promise.all(
      effects
        .map(({ type: effectName, lightsGroups, props: effectProps }) =>
          lightsGroups.map((groupId) =>
            sceneEffectRepo.save({
              sceneId,
              effectName,
              effectProps: JSON.stringify(effectProps),
              groupId,
            }),
          ),
        )
        .flat(),
    );
  }

  /**
   * Get the IDs of all lights groups referenced by the given effects that do not exist
   * @param effects
   */
  public async findMissingGroupIds(effects: LightsSceneEffectParams[]): Promise<number[]> {
    const lightsService = new RootLightsService();
    const groupIds = Array.from(new Set(effects.map((e) => e.lightsGroups).flat()));
    const dbGroups = await Promise.all(
      groupIds.map(async (id) => ({
        id,
        group: await lightsService.getSingleLightsGroup(id),
      })),
    );
    return dbGroups.filter(({ group }) => group == null).map(({ id }) => id);
  }

  public async getScenes(options?: GetLightsSceneOptions): Promise<LightsScene[]> {
    return this.repository.find({
      where: { favorite: options?.favorite },
    });
  }

  public async getSingleScene(id: number): Promise<LightsScene | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  public async createScene(params: CreateSceneParams): Promise<LightsScene> {
    const lightsScene = await getDataSource().transaction(async (manager) => {
      const sceneRepo = manager.getRepository(LightsScene);
      const scene: LightsScene = await sceneRepo.save({
        name: params.name,
        favorite: params.favorite,
      });

      await ScenesService.saveEffects(manager, scene.id, params.effects);

      return scene;
    });

    const dbScene = await this.getSingleScene(lightsScene.id);
    if (!dbScene) throw new Error('Newly created scene does not exist in the database');
    return dbScene;
  }

  /**
   * Replace the name, favorite status and all effects of the given scene
   * @param id
   * @param params
   */
  public async updateScene(id: number, params: UpdateSceneParams): Promise<LightsScene> {
    await getDataSource().transaction(async (manager) => {
      await manager.getRepository(LightsScene).update(id, {
        name: params.name,
        favorite: params.favorite,
      });
      await manager.getRepository(LightsSceneEffect).delete({ sceneId: id });
      await ScenesService.saveEffects(manager, id, params.effects);
    });

    const dbScene = await this.getSingleScene(id);
    if (!dbScene) throw new Error('Updated scene does not exist in the database');
    return dbScene;
  }

  public async deleteScene(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
