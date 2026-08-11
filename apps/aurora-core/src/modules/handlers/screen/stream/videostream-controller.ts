import { Controller } from '@tsoa/runtime';
import { Body, Get, Post, Request, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { VideostreamHandler } from '../index';
import HandlerManager from '../../../root/handler-manager';
import { Screen } from '../../../root/entities';
import { SecurityNames } from '../../../../helpers/security';
import { securityGroups } from '../../../../helpers/security-groups';
import logger from '../../../../logger';
import { VideostreamHandlerState } from './videostream-handler';

interface ResolveStreamRequest {
  url: string;
}

interface SeekStreamRequest {
  position: number; // seconds
}

@Route('handler/screen/videostream')
@Tags('Handlers')
export class VideostreamController extends Controller {
  private screenHandler: VideostreamHandler;

  constructor() {
    super();
    this.screenHandler = HandlerManager.getInstance()
      .getHandlers(Screen)
      .filter((h) => h.constructor.name === VideostreamHandler.name)[0] as VideostreamHandler;
  }

  /**
   * Return the current state of the videostream handler
   */
  @Security(SecurityNames.LOCAL, securityGroups.videostream.base)
  @Get('')
  public async getVideostreamHandlerState(): Promise<VideostreamHandlerState> {
    return this.screenHandler.getState();
  }

  /**
   * Probe the given media URL and make it available for playback, without
   * starting it yet.
   * @param req
   * @param body
   */
  @Security(SecurityNames.LOCAL, securityGroups.videostream.privileged)
  @Post('resolve')
  public async resolveVideostream(
    @Request() req: ExpressRequest,
    @Body() body: ResolveStreamRequest,
  ): Promise<VideostreamHandlerState> {
    logger.audit(req.user, `Resolve videostream (${body.url}).`);
    return this.screenHandler.resolve(body.url);
  }

  /**
   * Start playing the resolved stream from the beginning
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.videostream.privileged)
  @Post('play')
  public async playVideostream(@Request() req: ExpressRequest): Promise<VideostreamHandlerState> {
    logger.audit(req.user, `Play videostream.`);
    return this.screenHandler.play();
  }

  /**
   * Pause the stream, remembering the current position
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.videostream.privileged)
  @Post('pause')
  public async pauseVideostream(@Request() req: ExpressRequest): Promise<VideostreamHandlerState> {
    logger.audit(req.user, `Pause videostream.`);
    return this.screenHandler.pause();
  }

  /**
   * Resume a paused stream from where it left off
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.videostream.privileged)
  @Post('resume')
  public async resumeVideostream(@Request() req: ExpressRequest): Promise<VideostreamHandlerState> {
    logger.audit(req.user, `Resume videostream.`);
    return this.screenHandler.resume();
  }

  /**
   * Jump to the given position, restarting the stream there
   * @param req
   * @param body
   */
  @Security(SecurityNames.LOCAL, securityGroups.videostream.privileged)
  @Post('seek')
  public async seekVideostream(
    @Request() req: ExpressRequest,
    @Body() body: SeekStreamRequest,
  ): Promise<VideostreamHandlerState> {
    logger.audit(req.user, `Seek videostream to ${body.position}s.`);
    return this.screenHandler.seek(body.position);
  }

  /**
   * Stop playback, keeping the resolved stream available to play again
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.videostream.privileged)
  @Post('stop')
  public async stopVideostream(@Request() req: ExpressRequest): Promise<VideostreamHandlerState> {
    logger.audit(req.user, `Stop videostream.`);
    return this.screenHandler.stop();
  }
}
