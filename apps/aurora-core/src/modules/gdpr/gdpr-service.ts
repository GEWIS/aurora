import { AuditLogEntryResponse } from '../audit/audit-service';
import { AuditService } from '../audit';

export interface PersonalDataResponse {
  userId: string;
  auditLogs: AuditLogEntryResponse[];
}

export default class GdprService {
  /**
   * Get all personal data that belongs to the user with the given ID.
   * @param userId ID of the user to request information about.
   * @returns All information Aurora has on this user.
   */
  public async getPersonalData(userId: string): Promise<PersonalDataResponse> {
    const { records: auditLogs } = await new AuditService().getLogs({ userId });

    return {
      userId,
      auditLogs,
    };
  }
}
