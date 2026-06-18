import { Body, Get, Post, Route, Security, Tags, Request } from 'tsoa';
import { Controller, Path } from '@tsoa/runtime';
import { Request as ExpressRequest } from 'express';
import RootScreenService, { ScreenCreateParams, ScreenResponse } from './root-screen-service';
import { SecurityNames } from '../../helpers/security';
import { securityGroups } from '../../helpers/security-groups';
import { HttpApiException } from '../../helpers/custom-error';

@Route('screen')
@Tags('Screens')
export class RootScreenController extends Controller {
  @Security(SecurityNames.LOCAL, securityGroups.screen.base)
  @Get()
  public async getScreens(): Promise<ScreenResponse[]> {
    const screens = await new RootScreenService().getAllScreens();
    return screens.map((s) => RootScreenService.toScreenResponse(s));
  }

  /**
   * Get own screen entity if authenticated user is a screen
   */
  @Security(SecurityNames.LOCAL, securityGroups.screen.subscriber)
  @Get('me')
  public async getOwnScreen(@Request() req: ExpressRequest): Promise<ScreenResponse> {
    const screenId = req.user?.screenId;
    if (!screenId) {
      throw new HttpApiException(400, 'Authenticated user is not a screen subscriber.');
    }

    return this.getSingleScreen(screenId);
  }

  @Security(SecurityNames.LOCAL, securityGroups.screen.base)
  @Get('{id}')
  public async getSingleScreen(@Path() id: number): Promise<ScreenResponse> {
    const screen = await new RootScreenService().getSingleScreen(id);
    if (screen == null) {
      throw new HttpApiException(404, `Screen with id "${id}" not found.`);
    }

    return RootScreenService.toScreenResponse(screen);
  }

  @Security(SecurityNames.LOCAL, securityGroups.screen.privileged)
  @Post()
  public async createScreen(@Body() params: ScreenCreateParams): Promise<ScreenResponse> {
    const screen = await new RootScreenService().createScreen(params);
    return RootScreenService.toScreenResponse(screen);
  }
}
