import { Controller, Queries } from '@tsoa/runtime';
import { Get, Route, Security, Tags } from 'tsoa';
import AuditService, { GetAuditLogEntryParams } from './audit-service';
import { SecurityNames } from '../../helpers/security';
import { securityGroups } from '../../helpers/security-groups';

@Tags('Audit Logs')
@Route('audit-logs')
export class AuditController extends Controller {
  @Get()
  @Security(SecurityNames.LOCAL, securityGroups.audit.base)
  public async getAuditLogs(@Queries() params: GetAuditLogEntryParams) {
    const queryParams = {
      ...params,
      take: params.take ?? 50,
    };
    return new AuditService().getLogs(queryParams);
  }
}
