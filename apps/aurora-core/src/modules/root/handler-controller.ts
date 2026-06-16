import { Controller, Path } from '@tsoa/runtime';
import { Body, Get, Post, Request, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import HandlerManager from './handler-manager';
import { Audio, Screen } from './entities';
import RootAudioService, { AudioResponse } from './root-audio-service';
import { LightsGroup } from '../lights/entities';
import RootLightsService, { LightsGroupResponse } from './root-lights-service';
import RootScreenService, { ScreenResponse } from './root-screen-service';
import { SecurityNames } from '../../helpers/security';
import HandlerService from './handler-service';
import logger from '../../logger';
import { securityGroups } from '../../helpers/security-groups';

interface HandlerResponse<T> {
  entities: T[];
  id: string;
  name: string;
}

interface NewHandlerParams {
  name: string;
}

@Route('handler')
@Tags('Handlers')
export class HandlerController extends Controller {
  private handlersManager: HandlerManager;

  constructor() {
    super();
    this.handlersManager = HandlerManager.getInstance();
  }

  @Security(SecurityNames.LOCAL, securityGroups.handler.base)
  @Get('audio')
  public getAudioHandlers(): HandlerResponse<AudioResponse>[] {
    return this.handlersManager.getHandlers(Audio).map((h) => ({
      name: h.constructor.name,
      id: h.identifier,
      entities: h.entities.map((audio) => RootAudioService.toAudioResponse(audio as Audio)),
    }));
  }

  @Security(SecurityNames.LOCAL, securityGroups.handler.privileged)
  @Post('audio/{id}')
  public async setAudioHandler(
    @Request() req: ExpressRequest,
    @Path() id: number,
    @Body() params: NewHandlerParams,
  ) {
    const audio = await new RootAudioService().getSingleAudio(id);
    if (audio == null) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Change "${audio.name}" (id: ${id}) audio handler to "${params.name}".`);

    const found = this.handlersManager.registerHandler(audio, params.name);
    if (!found) {
      this.setStatus(400);
    }
  }

  @Security(SecurityNames.LOCAL, securityGroups.handler.base)
  @Get('lights')
  public getLightsHandlers(): HandlerResponse<LightsGroupResponse>[] {
    return this.handlersManager.getHandlers(LightsGroup).map((h) => ({
      name: h.constructor.name,
      id: h.identifier,
      entities: h.entities.map((lightsGroup) =>
        RootLightsService.toLightsGroupResponse(lightsGroup as LightsGroup),
      ),
    }));
  }

  @Security(SecurityNames.LOCAL, securityGroups.handler.privileged)
  @Post('lights/{id}')
  public async setLightsHandler(
    @Request() req: ExpressRequest,
    @Path() id: number,
    @Body() params: NewHandlerParams,
  ) {
    const group = await new RootLightsService().getSingleLightsGroup(id);
    if (group == null) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Change "${group.name}" (id: ${id}) lights group handler to "${params.name}".`,
    );

    const found = this.handlersManager.registerHandler(group, params.name);
    if (!found) {
      this.setStatus(400);
    }
  }

  @Security(SecurityNames.LOCAL, securityGroups.handler.base)
  @Security(SecurityNames.INTEGRATION, ['getScreenHandlers'])
  @Get('screen')
  public getScreenHandlers(): HandlerResponse<ScreenResponse>[] {
    return this.handlersManager.getHandlers(Screen).map((h) => ({
      name: h.constructor.name,
      id: h.identifier,
      entities: h.entities.map((screen) => RootScreenService.toScreenResponse(screen as Screen)),
    }));
  }

  @Security(SecurityNames.LOCAL, securityGroups.handler.privileged)
  @Security(SecurityNames.INTEGRATION, ['setScreenHandler'])
  @Post('screen/{id}')
  public async setScreenHandler(
    @Request() req: ExpressRequest,
    @Path() id: number,
    @Body() params: NewHandlerParams,
  ) {
    const screen = await new RootScreenService().getSingleScreen(id);
    if (screen == null) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Change "${screen.name}" (id: ${id}) screen handler to "${params.name}".`,
    );

    const found = this.handlersManager.registerHandler(screen, params.name);
    if (!found) {
      this.setStatus(400);
    }
  }

  @Security(SecurityNames.LOCAL, securityGroups.handler.privileged)
  @Post('all/reset-to-defaults')
  public async resetAllHandlersToDefaults(@Request() req: ExpressRequest) {
    logger.audit(req.user, `Reset all handlers to default state.`);
    await new HandlerService().resetToDefaults();
  }
}
