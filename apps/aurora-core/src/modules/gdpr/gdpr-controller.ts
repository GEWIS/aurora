import { Controller } from '@tsoa/runtime';
import { Get, Route, Security, Tags } from 'tsoa';
import { SecurityNames } from '../../helpers/security';
import GdprService from './gdpr-service';
import { securityGroups } from '../../helpers/security-groups';

@Tags('GDPR')
@Route('gdpr')
export class GdprController extends Controller {
  @Get('personal-data/{userId}')
  @Security(SecurityNames.LOCAL, securityGroups.gdrp.base)
  public getPersonalData(userId: string) {
    return new GdprService().getPersonalData(userId);
  }
}
