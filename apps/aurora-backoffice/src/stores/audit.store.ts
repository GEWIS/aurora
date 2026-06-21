import { defineStore } from 'pinia';
import { type AuditLogEntryResponse, getAuditLogs } from '@/api';
import { useSocketStore } from '@/stores/socket.store';

/**
 * Audit store
 * @param dashboardEntries - The log entries shown on the dashboard
 * @param entries - The log entries
 * @param take - The number of entries to show
 * @param skip - The number of entries to skip
 * @param count - The total number of pages needed to show all entries
 * @param loading - The loading state
 */
interface AuditStore {
  dashboardEntries: AuditLogEntryResponse[];
  entries: AuditLogEntryResponse[];
  take: number;
  skip: number;
  count: number;
  loading: boolean;
}

export const useAuditStore = defineStore('audit', {
  state: (): AuditStore => ({
    dashboardEntries: [],
    entries: [],
    take: 5,
    skip: 0,
    count: 0,
    loading: true,
  }),
  getters: {},
  actions: {
    /**
     * Handle the audit log addition
     * @param log
     */
    handleAuditLogAddition(log: AuditLogEntryResponse) {
      this.dashboardEntries = [log, ...this.dashboardEntries].slice(0, this.take);
    },
    /**
     * Initialize the store
     */
    async init() {
      const logs = await getAuditLogs({
        query: {
          take: this.take,
          skip: this.skip,
        },
      });
      this.dashboardEntries = logs.data!.records;
      this.count = logs.data!.pagination.count;

      this.loading = false;
      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('audit_log_create', this.handleAuditLogAddition.bind(this));
    },
    /**
     * Get the audit logs
     */
    async getLogs() {
      this.loading = true;
      const logs = await getAuditLogs({
        query: {
          take: this.take,
          skip: this.skip,
        },
      });
      this.entries = logs.data!.records;
      this.count = logs.data!.pagination.count;
      this.loading = false;
    },
    /**
     * Set the skip value
     * @param skip
     */
    async setSkip(skip: number) {
      this.skip = skip;
      await this.getLogs();
    },
    /**
     * Set the take value
     * @param take
     */
    async setTake(take: number) {
      this.take = take;
      await this.getLogs();
    },
    /**
     * Set the skip and take values at once
     * @param skip
     * @param take
     */
    async setSkipTake(skip?: number, take?: number) {
      if (skip) {
        this.skip = skip;
      }
      if (take) {
        this.take = take;
      }
      await this.getLogs();
    },
    /**
     * Destroy the store
     */
    destroy() {
      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.removeListener('audit_log_create', this.handleAuditLogAddition.bind(this));
    },
  },
});
