import HandlerManager from '../../../root/handler-manager';
import { Screen } from '../../../root/entities';
import { CarouselPosterHandler } from '../index';
import { Body, Get, Post, Put, Query, Request, Route, Security, Tags } from 'tsoa';
import { SecurityNames } from '../../../../helpers/security';
import { securityGroups } from '../../../../helpers/security-groups';
import logger from '../../../../logger';
import { Request as ExpressRequest } from 'express';
import NsTrainsService, { TrainResponse } from './ns-trains-service';
import GEWISPosterService, { GEWISPhotoAlbumParams } from './gewis-poster-service';
import OlympicsService from './olympics-service';
import { FeatureEnabled, ServerSettingsStore } from '../../../server-settings';
import { Controller } from '@tsoa/runtime';
import { ISettings } from '../../../server-settings/server-setting';
import { PosterResponse } from './local/poster-service';
import Poster from './local/poster';

export interface BorrelModeParams {
  enabled: boolean;
}

export interface BorrelModeResponse extends BorrelModeParams {
  present: boolean;
}

export interface EnabledParams {
  enabled: boolean;
}

export interface CarouselResponse {
  posters: PosterResponse[];
  borrelMode: boolean;
}

@Route('handler/screen/poster/carousel')
@Tags('Handlers')
@FeatureEnabled('Poster')
export class CarouselPosterController extends Controller {
  protected screenHandler: CarouselPosterHandler;

  constructor() {
    super();
    this.screenHandler = HandlerManager.getInstance()
      .getHandlers(Screen)
      .filter((h) => h.constructor.name === CarouselPosterHandler.name)[0] as CarouselPosterHandler;
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('')
  public async getPosters(@Query() includeHidden?: boolean): Promise<CarouselResponse> {
    const posters = await this.screenHandler.posterService.getAllPosters();

    let visible: Poster[];
    if (includeHidden) {
      visible = posters;
    } else {
      const now = new Date();
      const active = posters.filter(
        (p) =>
          p.enabled &&
          (p.startDate == null || p.startDate <= now) &&
          (p.expirationDate == null || p.expirationDate > now),
      );
      visible = this.screenHandler.borrelMode ? active : active.filter((p) => !p.borrelMode);
    }

    return {
      posters: visible.map((p) => this.screenHandler.posterService.toResponse(p)),
      borrelMode: this.screenHandler.borrelMode,
    };
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('force-update')
  public async forceUpdatePosters(@Request() req: ExpressRequest): Promise<void> {
    logger.audit(req.user, 'Force refresh carousel on screens.');
    this.screenHandler.forceUpdate();
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('borrel-mode')
  public async getPosterBorrelMode(): Promise<BorrelModeResponse> {
    return {
      present: this.screenHandler.borrelModeIsPresent(),
      enabled: this.screenHandler.borrelMode,
    };
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Put('borrel-mode')
  @FeatureEnabled('Poster.BorrelModePresent')
  public async setPosterBorrelMode(
    @Request() req: ExpressRequest,
    @Body() body: BorrelModeParams,
  ): Promise<void> {
    logger.audit(
      req.user,
      `Set poster screen borrel mode to "${body.enabled ? 'true' : 'false'}".`,
    );
    this.screenHandler.setBorrelModeEnabled(body.enabled);
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('{id}/enabled')
  public async togglePosterEnable(
    id: number,
    @Body() body: EnabledParams,
  ): Promise<PosterResponse> {
    const poster = await this.screenHandler.posterService.togglePosterEnable(id, body.enabled);
    return this.screenHandler.posterService.toResponse(poster);
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('train-departures')
  public async getTrains(): Promise<TrainResponse[]> {
    return new NsTrainsService().getTrains();
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Post('photo')
  public async getPhoto(@Body() params: GEWISPhotoAlbumParams) {
    return new GEWISPosterService().getPhoto(params);
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('olympics/medal-table')
  public async getOlympicsMedalTable() {
    return new OlympicsService().getMedalTable();
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('olympics/country-medals')
  public async getDutchOlympicMedals() {
    return new OlympicsService().getDutchMedals();
  }
}
