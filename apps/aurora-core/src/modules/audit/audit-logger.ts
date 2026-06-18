import logger from '../../logger';
import AuditService from './audit-service';
import { AuthUser } from '../auth';
import { isAuthUser } from '../auth/auth-user';

/**
 * Log an audit message
 * @param user - The user who performed the action
 * @param msg - The message to log
 * @param args - Additional arguments to log
 */
export function logAudit(user: unknown, msg?: string, ...args: any[]): void {
  // If there is no message to be logged, return immediately
  if (!msg) return;
  // Check if the provided user is valid, otherwise return
  if (!isAuthUser(user)) {
    logger.error(
      user,
      `Ran into an issue when logging "${msg}": invalid user provided, no id/name present`,
    );
    return;
  }
  logger.trace<AuthUser>(user, msg, args);

  new AuditService()
    .addLog({ userId: user.id, userName: user.name, action: msg })
    .catch((e) => logger.error(e));
}

logger.audit = logAudit;
