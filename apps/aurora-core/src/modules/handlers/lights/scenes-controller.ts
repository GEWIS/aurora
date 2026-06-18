import { Controller, TsoaResponse } from '@tsoa/runtime';
import { Body, Delete, Get, Post, Query, Request, Res, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import ScenesService, { CreateSceneParams, LightsSceneResponse } from './scenes-service';
import RootLightsService from '../../root/root-lights-service';
import HandlerManager from '../../root/handler-manager';
import { LightsGroup } from '../../lights/entities';
import { ScenesHandler } from './scenes-handler';
import { SecurityNames } from '../../../helpers/security';
import logger from '../../../logger';
import { securityGroups } from '../../../helpers/security-groups';

@Route('handler/lights/scenes')
@Tags('Handlers')
export class ScenesController extends Controller {
  /**
   * Get a list of all scenes
   * @param favorite Whether to return only scenes that are (not) marked as favorite
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Get('')
  public async getAllScenes(@Query() favorite?: boolean): Promise<LightsSceneResponse[]> {
    const scenes = await new ScenesService().getScenes({ favorite });
    return scenes.map((s) => ScenesService.toSceneResponse(s));
  }

  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Get('{id}')
  public async getSingleScene(id: number): Promise<LightsSceneResponse | undefined> {
    const scene = await new ScenesService().getSingleScene(id);
    if (!scene) {
      this.setStatus(404);
      return undefined;
    }
    return ScenesService.toSceneResponse(scene);
  }

  /**
   * Create a new scene
   * @param req
   * @param params
   * @param invalidSceneResponse
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.privileged)
  @Post('')
  public async createScene(
    @Request() req: ExpressRequest,
    @Body() params: CreateSceneParams,
    @Res() invalidSceneResponse: TsoaResponse<400, { reason: string }>,
  ) {
    logger.audit(req.user, `Create a new lights scene "${params.name}".`);

    const lightsService = new RootLightsService();

    const lightGroupIds = params.effects
      .map((e) => e.lightsGroups)
      .flat()
      .sort();
    const dbGroups = await Promise.all(
      lightGroupIds.map(async (id) => ({
        id,
        group: await lightsService.getSingleLightsGroup(id),
      })),
    );
    const missingGroups = dbGroups.filter(({ group }) => group == null);
    if (missingGroups.length > 0) {
      return invalidSceneResponse(400, {
        reason: `LightsGroups with IDs ${missingGroups.join(',')} do not exist.`,
      });
    }

    const scene = await new ScenesService().createScene(params);
    return ScenesService.toSceneResponse(scene);
  }

  @Security(SecurityNames.LOCAL, securityGroups.scenes.privileged)
  @Delete('{id}')
  public async deleteScene(@Request() req: ExpressRequest, id: number) {
    const service = new ScenesService();
    const scene = await service.getSingleScene(id);

    logger.audit(req.user, `Delete lights scene "${scene?.name}" (id: ${id}).`);

    if (!scene) {
      this.setStatus(404);
      return;
    }
    await service.deleteScene(id);
  }

  /**
   * Apply the current scene to all lights that are registered to the ScenesHandler
   * @param req
   * @param id
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Post('{id}/apply')
  public async applyScene(@Request() req: ExpressRequest, id: number) {
    const service = new ScenesService();
    const scene = await service.getSingleScene(id);

    logger.audit(req.user, `Apply lights scene "${scene?.name}" (id: ${id}).`);

    if (!scene) {
      this.setStatus(404);
      return;
    }

    const handler: ScenesHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === ScenesHandler.name) as ScenesHandler | undefined;
    if (!handler) throw new Error('ScenesHandler not found');

    handler.applyScene(scene);
  }

  /**
   * Clear the scene that is applied to the ScenesHandler
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Delete('clear')
  public async clearScene(@Request() req: ExpressRequest) {
    const handler: ScenesHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === ScenesHandler.name) as ScenesHandler | undefined;
    if (!handler) throw new Error('ScenesHandler not found');

    logger.audit(req.user, 'Clear currently active lights scene.');

    handler.clearScene();
  }
}
