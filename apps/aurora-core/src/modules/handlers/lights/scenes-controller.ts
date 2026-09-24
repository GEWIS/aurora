import { Controller, TsoaResponse } from '@tsoa/runtime';
import { injectable } from 'inversify';
import { Body, Delete, Get, Post, Query, Request, Res, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import ScenesService, {
  ActiveSceneResponse,
  CreateSceneParams,
  LightsSceneResponse,
  UpdateSceneParams,
} from './scenes-service';
import HandlerManager from '../../root/handler-manager';
import { LightsGroup } from '../../lights/entities';
import { ScenesHandler } from './scenes-handler';
import { SecurityNames } from '../../../helpers/security';
import logger from '../../../logger';
import { securityGroups } from '../../../helpers/security-groups';

@injectable()
@Route('handler/lights/scenes')
@Tags('Handlers')
export class ScenesController extends Controller {
  constructor(private readonly handlerManager: HandlerManager) {
    super();
  }

  /**
   * Get a list of all scenes
   * @param favorite Whether to return only scenes that are (not) marked as favorite
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Get('scene')
  public async getAllScenes(@Query() favorite?: boolean): Promise<LightsSceneResponse[]> {
    const scenes = await new ScenesService().getScenes({ favorite });
    return scenes.map((s) => ScenesService.toSceneResponse(s));
  }

  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Get('scene/{id}')
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
  @Post('scene')
  public async createScene(
    @Request() req: ExpressRequest,
    @Body() params: CreateSceneParams,
    @Res() invalidSceneResponse: TsoaResponse<400, { reason: string }>,
  ) {
    logger.audit(req.user, `Create a new lights scene "${params.name}".`);

    const service = new ScenesService();

    const missingGroupIds = await service.findMissingGroupIds(params.effects);
    if (missingGroupIds.length > 0) {
      return invalidSceneResponse(400, {
        reason: `LightsGroups with IDs ${missingGroupIds.join(',')} do not exist.`,
      });
    }

    const scene = await service.createScene(params);
    return ScenesService.toSceneResponse(scene);
  }

  /**
   * Replace the name, favorite status and effects of an existing scene.
   * If the scene is currently active, it is reapplied with the new effects.
   * @param req
   * @param id
   * @param params
   * @param invalidSceneResponse
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.privileged)
  @Put('scene/{id}')
  public async updateScene(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: UpdateSceneParams,
    @Res() invalidSceneResponse: TsoaResponse<400, { reason: string }>,
  ): Promise<LightsSceneResponse | undefined> {
    const service = new ScenesService();
    const scene = await service.getSingleScene(id);

    logger.audit(req.user, `Update lights scene "${scene?.name}" (id: ${id}).`);

    if (!scene) {
      this.setStatus(404);
      return undefined;
    }

    const missingGroupIds = await service.findMissingGroupIds(params.effects);
    if (missingGroupIds.length > 0) {
      return invalidSceneResponse(400, {
        reason: `LightsGroups with IDs ${missingGroupIds.join(',')} do not exist.`,
      });
    }

    const updatedScene = await service.updateScene(id, params);

    const handler: ScenesHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === ScenesHandler.name) as ScenesHandler | undefined;
    if (handler?.getActiveSceneId() === id) {
      handler.applyScene(updatedScene);
    }

    return ScenesService.toSceneResponse(updatedScene);
  }

  @Security(SecurityNames.LOCAL, securityGroups.scenes.privileged)
  @Delete('scene/{id}')
  public async deleteScene(@Request() req: ExpressRequest, id: number) {
    const service = new ScenesService();
    const scene = await service.getSingleScene(id);

    logger.audit(req.user, `Delete lights scene "${scene?.name}" (id: ${id}).`);

    if (!scene) {
      this.setStatus(404);
      return;
    }
    await service.deleteScene(id);

    const handler: ScenesHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === ScenesHandler.name) as ScenesHandler | undefined;
    if (handler?.getActiveSceneId() === id) {
      handler.clearScene();
    }
  }

  /**
   * Apply the current scene to all lights that are registered to the ScenesHandler
   * @param req
   * @param id
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Post('scene/{id}/apply')
  public async applyScene(@Request() req: ExpressRequest, id: number) {
    const service = new ScenesService();
    const scene = await service.getSingleScene(id);

    logger.audit(req.user, `Apply lights scene "${scene?.name}" (id: ${id}).`);

    if (!scene) {
      this.setStatus(404);
      return;
    }

    const handler: ScenesHandler | undefined = this.handlerManager
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === ScenesHandler.name) as ScenesHandler | undefined;
    if (!handler) throw new Error('ScenesHandler not found');

    handler.applyScene(scene);
  }

  /**
   * Get the scene that is currently applied to the ScenesHandler, if any
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Get('active')
  public async getActiveScene(): Promise<ActiveSceneResponse> {
    const handler: ScenesHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === ScenesHandler.name) as ScenesHandler | undefined;
    if (!handler) throw new Error('ScenesHandler not found');

    const activeSceneId = handler.getActiveSceneId();
    if (activeSceneId == null) return { scene: null };

    const scene = await new ScenesService().getSingleScene(activeSceneId);
    return { scene: scene ? ScenesService.toSceneResponse(scene) : null };
  }

  /**
   * Clear the scene that is applied to the ScenesHandler
   */
  @Security(SecurityNames.LOCAL, securityGroups.scenes.base)
  @Delete('active')
  public async clearScene(@Request() req: ExpressRequest) {
    const handler: ScenesHandler | undefined = this.handlerManager
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === ScenesHandler.name) as ScenesHandler | undefined;
    if (!handler) throw new Error('ScenesHandler not found');

    logger.audit(req.user, 'Clear currently active lights scene.');

    handler.clearScene();
  }
}
