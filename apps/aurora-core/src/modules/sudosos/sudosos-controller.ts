import { Controller, Get, Route, Security, Tags } from 'tsoa';
import { Response } from '@tsoa/runtime';
import SudoSOSService from './sudosos-service';
import { FeatureEnabled } from '../server-settings';
import { SecurityNames } from '../../helpers/security';
import { securityGroups } from '../../helpers/security-groups';

@Tags('Handlers')
@Route('handler/screen/poster/sudosos')
@FeatureEnabled('SudoSOS')
export class SudoSOSController extends Controller {
  @Security(SecurityNames.LOCAL, securityGroups.sudosos.subscriber)
  @Get('wall-of-shame')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public async getSudoSOSWallOfShame() {
    return (await new SudoSOSService().initialize()).getDebtors();
  }

  @Security(SecurityNames.LOCAL, securityGroups.sudosos.subscriber)
  @Get('price-list')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public async getSudoSOSPriceList() {
    return (await new SudoSOSService().initialize()).getPriceList();
  }
}
