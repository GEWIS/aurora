import { Controller } from '@tsoa/runtime';
import { Body, Delete, Get, Post, Request, Route, Security, Tags } from 'tsoa';
import { StaticPosterHandler } from '../../index';
import HandlerManager from '../../../../root/handler-manager';
import { Screen } from '../../../../root/entities';
import { SecurityNames } from '../../../../../helpers/security';
import { securityGroups } from '../../../../../helpers/security-groups';
import { Request as ExpressRequest } from 'express';
import logger from '../../../../../logger';
import { StaticPosterHandlerState } from '../static-poster-handler';
import PosterService from '../local/poster-service';

interface SetClockRequest {
  visible: boolean;
}

@Route('handler/screen/poster/static')
@Tags('Handlers')
export class StaticPosterController extends Controller {
  private screenHandler: StaticPosterHandler;

  constructor() {
    super();
    this.screenHandler = HandlerManager.getInstance()
      .getHandlers(Screen)
      .filter((h) => h.constructor.name === StaticPosterHandler.name)[0] as StaticPosterHandler;
  }

  /**
   * Return the current state (or settings) of the static poster handler
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('')
  public async getStaticPosterHandlerState(): Promise<StaticPosterHandlerState> {
    return this.screenHandler.getState();
  }

  /**
   * Hide the static poster currently shown on screens. The subscribers should
   * revert to their default view.
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Delete('')
  public async hideStaticPoster(@Request() req: ExpressRequest): Promise<void> {
    logger.audit(req.user, `Hide static poster.`);
    this.screenHandler.removeActivePoster();
  }

  /**
   * Change the visibility of the clock on-screen
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('clock')
  public async setStaticPosterClock(
    @Request() req: ExpressRequest,
    @Body() { visible }: SetClockRequest,
  ): Promise<void> {
    logger.audit(req.user, `Make clock in StaticPosterHandler ${visible ? 'visible' : 'invisible'}.`);
    this.screenHandler.setClockVisibility(visible);

  /**
   * Show the given static poster on all screens using the StaticPosterHandler.
   * @param id
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Security(SecurityNames.INTEGRATION, ['showStaticPoster'])
  @Post('items/{id}/show')
  public async showStaticPoster(id: number, @Request() req: ExpressRequest): Promise<void> {
    const service = new PosterService();
    const poster = await service.getSinglePoster(id);
    const posterResponse = service.toResponse(poster);

    logger.audit(req.user, `Show static poster (id: ${id}).`);
    this.screenHandler.setActivePoster(posterResponse);
  }
}
