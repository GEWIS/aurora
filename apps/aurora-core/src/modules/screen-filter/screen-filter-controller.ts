import { Controller } from '@tsoa/runtime';
import { injectable } from 'inversify';
import { Body, Get, Put, Request, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { SecurityNames } from '../../helpers/security';
import { securityGroups } from '../../helpers/security-groups';
import logger from '../../logger';
import { FeatureEnabled } from '../server-settings';
import ScreenFilterManager, {
  ScreenFilterParams,
  ScreenFilterState,
} from './screen-filter-manager';

@Tags('ScreenFilter')
@injectable()
@Route('screen-filter')
@FeatureEnabled('ScreenFilter')
export class ScreenFilterController extends Controller {
  constructor(private readonly screenFilterManager: ScreenFilterManager) {
    super();
  }

  /**
   * Get the dimming and blue light filter currently applied to all screens
   */
  @Security(SecurityNames.LOCAL, securityGroups.screenFilter.base)
  @Get('')
  public async getScreenFilter(): Promise<ScreenFilterState> {
    return this.screenFilterManager.getState();
  }

  /**
   * Change the dimming and blue light filter applied to all screens,
   * optionally fading gradually to the new values
   */
  @Security(SecurityNames.LOCAL, securityGroups.screenFilter.privileged)
  @Put('')
  public async setScreenFilter(
    @Request() req: ExpressRequest,
    @Body() body: ScreenFilterParams,
  ): Promise<ScreenFilterState> {
    const state = await this.screenFilterManager.setState(body);
    logger.audit(
      req.user,
      `Set screen filter to brightness ${state.brightness}% and warmth ${state.warmth}%` +
        (body.transitionSeconds ? ` over ${body.transitionSeconds} seconds.` : '.'),
    );
    return state;
  }
}
