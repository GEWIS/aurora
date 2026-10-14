import { Controller } from '@tsoa/runtime';
import { injectable } from 'inversify';
import { Body, Get, Put, Request, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { SecurityNames } from '../../helpers/security';
import { securityGroups } from '../../helpers/security-groups';
import logger from '../../logger';
import BorrelModeManager, { BorrelModeParams, BorrelModeState } from './borrel-mode-manager';

@Tags('BorrelMode')
@injectable()
@Route('borrel-mode')
export class BorrelModeController extends Controller {
  constructor(private readonly borrelModeManager: BorrelModeManager) {
    super();
  }

  /**
   * Get whether borrel mode is available and whether it is currently active.
   */
  @Security(SecurityNames.LOCAL, securityGroups.borrelMode.base)
  @Get('')
  public async getBorrelMode(): Promise<BorrelModeState> {
    return this.borrelModeManager.getState();
  }

  /**
   * Activate or deactivate borrel mode until the end of the day
   */
  @Security(SecurityNames.LOCAL, securityGroups.borrelMode.privileged)
  @Put('')
  public async setBorrelMode(
    @Request() req: ExpressRequest,
    @Body() body: BorrelModeParams,
  ): Promise<BorrelModeState> {
    logger.audit(req.user, `Set borrel mode to "${body.enabled ? 'true' : 'false'}".`);
    return this.borrelModeManager.setActive(body.enabled);
  }
}
