import { Repository } from 'typeorm';
import LightsPredefinedEffect, {
  LightsPredefinedEffectProperties,
} from '../../lights/entities/scenes/lights-predefined-effect';
import dataSource from '../../../database';
import { HttpApiException } from '../../../helpers/custom-error';
import { HttpStatusCode } from 'axios';

export interface LightsPredefinedEffectResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  buttonId: number;
  icon?: string | null;
  name?: string | null;
  properties: LightsPredefinedEffectProperties;
}

export interface LightsPredefinedEffectCreateParams extends Pick<
  LightsPredefinedEffect,
  'buttonId' | 'properties' | 'icon' | 'name'
> {}

export interface LightsPredefinedEffectUpdateParams extends Partial<LightsPredefinedEffectCreateParams> {}

export default class SetEffectsService {
  private repo: Repository<LightsPredefinedEffect>;

  constructor(repo?: Repository<LightsPredefinedEffect>) {
    this.repo = repo ?? dataSource.getRepository(LightsPredefinedEffect);
  }

  public static toLightsEffectPredefinedEffectResponse(
    e: LightsPredefinedEffect,
  ): LightsPredefinedEffectResponse {
    return {
      id: e.id,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      buttonId: e.buttonId,
      name: e.name,
      icon: e.icon,
      properties: e.properties,
    };
  }

  public async getAllPredefinedEffects(): Promise<LightsPredefinedEffect[]> {
    return this.repo.find();
  }

  public async getSinglePredefinedEffect({
    id,
    buttonId,
  }: {
    id?: number;
    buttonId?: number;
  }): Promise<LightsPredefinedEffect | null> {
    return this.repo.findOne({ where: { id, buttonId } });
  }

  public async createPredefinedEffect(
    params: LightsPredefinedEffectCreateParams,
  ): Promise<LightsPredefinedEffect> {
    const existing = await this.getSinglePredefinedEffect({ buttonId: params.buttonId });
    if (existing) {
      throw new HttpApiException(
        HttpStatusCode.BadRequest,
        `Effect with button ID "${params.buttonId}" already exists.`,
      );
    }

    return this.repo.save(params);
  }

  public async updatePredefinedEffect(
    id: number,
    params: LightsPredefinedEffectUpdateParams,
  ): Promise<LightsPredefinedEffect> {
    const existing = await this.getSinglePredefinedEffect({ id });
    if (!existing) {
      throw new HttpApiException(HttpStatusCode.NotFound, `Effect with ID "${id}" not found.`);
    }

    // New button ID
    if (params.buttonId !== undefined && existing.buttonId !== params.buttonId) {
      const buttonMatch = await this.getSinglePredefinedEffect({ buttonId: params.buttonId });
      if (buttonMatch) {
        throw new HttpApiException(
          HttpStatusCode.BadRequest,
          `Effect with button ID "${params.buttonId}" already exists."`,
        );
      }
      existing.buttonId = params.buttonId;
    }

    if (params.properties) existing.properties = params.properties;
    if (params.name) existing.name = params.name;
    if (params.icon) existing.icon = params.icon;

    return this.repo.save(existing);
  }

  public async deletePredefinedEffect(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
