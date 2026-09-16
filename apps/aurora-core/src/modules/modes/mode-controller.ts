import { Body, Delete, Post, Request, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { injectable } from 'tsyringe';
import { container, registerPort } from '../../ioc';
import { Controller, Response } from '@tsoa/runtime';
import { In } from 'typeorm';
import { Request as ExpressRequest } from 'express';
import ModeManager from './mode-manager';
import HandlerManager from '../root/handler-manager';
import ModeSession from './mode-session';
import LightsControl from '../plugins/ports/lights-control';
import AudioControl from '../plugins/ports/audio-control';
import ScreenChannel from '../plugins/ports/screen-channel';
import BeatSource from '../plugins/ports/beat-source';
import BeatManager from '../beats/beat-manager';
import SetEffectsHandler from '../handlers/lights/set-effects-handler';
import SimpleAudioHandler from '../handlers/audio/simple-audio-handler';
import { CenturionScreenHandler, TimeTrailRaceScreenHandler } from '../handlers/screen';
import TimeTrailRaceLightsHandler from '../handlers/lights/time-trail-race-lights-handler';
import SubscribeEntity from '../root/entities/subscribe-entity';
import { LightsGroup } from '../lights/entities';
import { Audio, Screen } from '../root/entities';
import CenturionMode from './centurion/centurion-mode';
import tapes from './centurion/tapes';
import { getDataSource } from '../../database';
import { SecurityNames } from '../../helpers/security';
import { HttpStatusCode } from '../../helpers/custom-error';
import TimeTrailRaceMode from './time-trail-race/time-trail-race-mode';
import logger from '../../logger';
import { FeatureEnabled } from '../server-settings';
import { securityGroups } from '../../helpers/security-groups';

interface EnableModeParams {
  lightsGroupIds: number[];
  screenIds: number[];
  audioIds: number[];
}

interface CenturionParams extends EnableModeParams {
  centurionName: string;
  centurionArtist: string;
}

interface TimeTrailRaceParams extends EnableModeParams {
  sessionName: string;
}

@injectable()
@Route('modes')
@Tags('Modes')
export class ModeController extends Controller {
  constructor(
    private readonly modeManager: ModeManager,
    private readonly handlerManager: HandlerManager,
    private readonly beatManager: BeatManager,
  ) {
    super();
  }

  private async findEntities(
    entity: typeof SubscribeEntity,
    ids: number[],
  ): Promise<SubscribeEntity[]> {
    return getDataSource()
      .getRepository(entity)
      .find({ where: { id: In(ids) } });
  }

  private async mapBodyToEntities(params: EnableModeParams) {
    const lights = (await this.findEntities(LightsGroup, params.lightsGroupIds)) as LightsGroup[];
    const screens = (await this.findEntities(Screen, params.screenIds)) as Screen[];
    const audios = (await this.findEntities(Audio, params.audioIds)) as Audio[];

    return { lights, screens, audios };
  }

  /**
   * Disable all modes, if one is active
   */
  @Security(SecurityNames.LOCAL, securityGroups.mode.base)
  @Delete('')
  @SuccessResponse(HttpStatusCode.Ok)
  public disableAllModes(@Request() req: ExpressRequest) {
    logger.audit(req.user, 'Disable all modes.');
    this.modeManager.reset();
  }

  /**
   * Enable Centurion mode for the given devices
   */
  @Security(SecurityNames.LOCAL, securityGroups.centurion.privileged)
  @Post('centurion')
  @FeatureEnabled('Centurion')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  @SuccessResponse(HttpStatusCode.NoContent)
  public async enableCenturion(
    @Request() req: ExpressRequest,
    @Body() params: CenturionParams,
  ): Promise<string> {
    logger.audit(req.user, `Enable Centurion mode with tape "${params.centurionName}".`);

    const tape = tapes.find((t) => {
      return t.name === params.centurionName && t.artist === params.centurionArtist;
    });
    if (tape === undefined) {
      this.setStatus(404);
      return 'Centurion tape not found.';
    }

    const { lights, screens, audios } = await this.mapBodyToEntities(params);

    const lightsHandler = this.handlerManager.requireHandler(LightsGroup, SetEffectsHandler);
    const screenHandler = this.handlerManager.requireHandler(Screen, CenturionScreenHandler);
    const audioHandler = this.handlerManager.requireHandler(Audio, SimpleAudioHandler);

    const session = new ModeSession(this.handlerManager, [
      { entities: lights, handler: lightsHandler },
      { entities: screens, handler: screenHandler },
      { entities: audios, handler: audioHandler },
    ]);
    session.claim();

    await this.modeManager.enableMode(CenturionMode, 'centurion', session, async () => {
      const scope = container.createChildContainer();
      registerPort(scope, LightsControl, lightsHandler);
      registerPort(scope, AudioControl, audioHandler);
      registerPort(scope, ScreenChannel, screenHandler);
      registerPort(scope, BeatSource, this.beatManager);

      const centurionMode = scope.resolve(CenturionMode);
      await centurionMode.initialize(this.modeManager.musicEmitter);
      centurionMode.loadTape(tape);
      return centurionMode;
    });

    this.setStatus(204);
    return '';
  }

  @Security(SecurityNames.LOCAL, securityGroups.centurion.privileged)
  @Delete('centurion')
  @FeatureEnabled('Centurion')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  @SuccessResponse(HttpStatusCode.Ok)
  public disableCenturion(@Request() req: ExpressRequest) {
    logger.audit(req.user, 'Disable Centurion mode.');
    this.modeManager.disableMode(CenturionMode, 'centurion');
  }

  /**
   * Enable Time Trail Race (spoelbakkenrace) mode for the given devices
   */
  @Security(SecurityNames.LOCAL, securityGroups.timetrail.base)
  @Post('time-trail-race')
  @FeatureEnabled('TimeTrailRace')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  @SuccessResponse(HttpStatusCode.NoContent)
  public async enableTimeTrailRace(
    @Request() req: ExpressRequest,
    @Body() params: TimeTrailRaceParams,
  ): Promise<string> {
    logger.audit(req.user, `Enable Spoelbakkenrace mode for "${params.sessionName}".`);

    const { lights, screens, audios } = await this.mapBodyToEntities(params);

    const lightsHandler = this.handlerManager.requireHandler(
      LightsGroup,
      TimeTrailRaceLightsHandler,
    );
    const screenHandler = this.handlerManager.requireHandler(Screen, TimeTrailRaceScreenHandler);
    const audioHandler = this.handlerManager.requireHandler(Audio, SimpleAudioHandler);

    const session = new ModeSession(this.handlerManager, [
      { entities: lights, handler: lightsHandler },
      { entities: screens, handler: screenHandler },
      { entities: audios, handler: audioHandler },
    ]);
    session.claim();

    await this.modeManager.enableMode(TimeTrailRaceMode, 'time-trail-racing', session, () => {
      const scope = container.createChildContainer();
      scope.registerInstance(TimeTrailRaceLightsHandler, lightsHandler);
      registerPort(scope, AudioControl, audioHandler);
      registerPort(scope, ScreenChannel, screenHandler);
      registerPort(scope, BeatSource, this.beatManager);

      const timeTrailRaceMode = scope.resolve(TimeTrailRaceMode);
      timeTrailRaceMode.initialize(this.modeManager.backofficeSyncEmitter, params.sessionName);
      return timeTrailRaceMode;
    });

    this.setStatus(204);
    return '';
  }

  @Security(SecurityNames.LOCAL, securityGroups.timetrail.base)
  @Delete('time-trail-race')
  @FeatureEnabled('TimeTrailRace')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  @SuccessResponse(HttpStatusCode.Ok)
  public disableTimeTrailRacing(@Request() req: ExpressRequest) {
    logger.audit(req.user, 'Disable Spoelbakkenrace mode.');
    this.modeManager.disableMode(TimeTrailRaceMode, 'time-trail-racing');
  }
}
