import { Get, Route, Security, Tags } from 'tsoa';
import { injectable } from 'inversify';
import { Controller } from '@tsoa/runtime';
import { FeatureEnabled, ServerSettingsStore } from '../../server-settings';
import { ISettings } from '../../server-settings/server-setting';
import { SecurityNames } from '../../../helpers/security';
import { securityGroups } from '../../../helpers/security-groups';

@injectable()
@Route('handler/screen/poster')
@Tags('Handlers')
@FeatureEnabled('RoomResponsibleLegacyScreenURL')
export class RoomResponsibleLegacyController extends Controller {
  constructor(private readonly serverSettingsStore: ServerSettingsStore) {
    super();
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('room-responsible-legacy-url')
  public getRoomResponsibleLegacyUrl(): string {
    return this.serverSettingsStore.getSetting(
      'RoomResponsibleLegacyScreenURL',
    ) as ISettings['RoomResponsibleLegacyScreenURL'];
  }
}
