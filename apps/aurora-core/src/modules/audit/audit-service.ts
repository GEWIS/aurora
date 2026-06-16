import { LessThanOrEqual, Repository } from 'typeorm';
import AuditLogEntry from './entities/audit-log-entry';
import dataSource from '../../database';
import EmitterStore from '../events/emitter-store';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';

export interface GetAuditLogEntryParams {
  /**
   * Id of the user
   */
  userId?: string;

  /**
   * Actions
   */
  action?: string;

  /**
   * In what order to return the logs. DESC by default (newest first)
   */
  order?: 'ASC' | 'DESC';

  /**
   * Pagination take
   * @isInt
   * @minimum 0
   */
  take?: number;

  /**
   * Pagination skip
   * @isInt
   * @minimum 0
   */
  skip?: number;
}

export interface CreateAuditLogEntryParams extends Pick<
  AuditLogEntry,
  'userId' | 'userName' | 'action'
> {}

export interface AuditLogEntryResponse extends Pick<
  AuditLogEntry,
  'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'action'
> {}

interface PaginatedAuditLogEntryResponse {
  records: AuditLogEntryResponse[];
  pagination: {
    take: number;
    skip: number;
    count: number;
  };
}

export default class AuditService {
  private repo: Repository<AuditLogEntry>;

  private backofficeEmitter: BackofficeSyncEmitter;

  constructor() {
    this.repo = dataSource.getRepository(AuditLogEntry);

    this.backofficeEmitter = EmitterStore.getInstance().backofficeSyncEmitter;
  }

  private toAuditLogEntryResponse(entry: AuditLogEntry): AuditLogEntryResponse {
    return {
      id: entry.id,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      userId: entry.userId,
      userName: entry.userName,
      action: entry.action,
    };
  }

  /**
   * Get audit logs
   * @param userId
   * @param action
   * @param order
   * @param take
   * @param skip
   */
  public async getLogs({
    userId,
    action,
    order,
    take,
    skip,
  }: GetAuditLogEntryParams): Promise<PaginatedAuditLogEntryResponse> {
    const records = await this.repo.find({
      where: { userId, action },
      order: { createdAt: order ?? 'DESC' },
      take,
      skip,
    });

    if (take) {
      return {
        records: records.map(this.toAuditLogEntryResponse),
        pagination: {
          take,
          skip: skip || 0,
          count: await this.repo.count({ where: { userId, action } }),
        },
      };
    }

    return {
      records: records.map(this.toAuditLogEntryResponse),
      pagination: {
        take: records.length,
        skip: 0,
        count: records.length,
      },
    };
  }

  /**
   * Save write a new audit log entry to the database
   * @param params
   */
  public async addLog(params: CreateAuditLogEntryParams) {
    const log = await this.repo.save(params);
    this.backofficeEmitter.emit('audit_log_create', this.toAuditLogEntryResponse(log));
  }

  /**
   * Delete all audit logs that have passed their maximum age.
   * This age is defined as environment variable `AUDIT_LOGS_MAX_AGE_DAYS`.
   */
  public async removeExpiredAuditLogs() {
    const maxAgeDays = Number(process.env.AUDIT_LOGS_MAX_AGE_DAYS);
    if (Number.isNaN(maxAgeDays)) {
      throw new Error(
        `"AUDIT_LOGS_MAX_AGE_DAYS" is not an integer variable, "${process.env.AUDIT_LOGS_MAX_AGE_DAYS}" instead`,
      );
    }

    const ageDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * maxAgeDays);
    const expired = await this.repo.find({ where: { createdAt: LessThanOrEqual(ageDate) } });
    await this.repo.remove(expired);
  }
}
