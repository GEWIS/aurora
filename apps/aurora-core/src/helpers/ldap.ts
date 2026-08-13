import { Client } from 'ldapts';
import logger from '../logger';

/**
 * Connection + search settings for the (read-only) LDAP/Active Directory bind.
 * Mirrors SudoSOS' `getLDAPSettings`: a single service account that may read the
 * directory, plus the base DN every search is rooted at.
 */
export interface LdapSettings {
  url: string;
  bindDn: string;
  bindPassword: string;
  base: string;
  /** Group DNs whose members carry the matching keyholder flag. */
  groups: {
    board?: string;
    candidateBoard?: string;
    keyholder?: string;
  };
  /** How often the keyholder sync runs; 0 disables the periodic run. */
  syncIntervalMinutes: number;
}

/**
 * AD's "member of, transitively" matching rule. Without it a nested group (a
 * committee inside the keyholder group) would not resolve to its people.
 */
export const LDAP_MATCHING_RULE_IN_CHAIN = '1.2.840.113556.1.4.1941';

/**
 * Read the LDAP configuration from the environment, or null when the
 * integration is not configured. Like the other optional integrations, the
 * feature stays off unless every connection variable and at least one group DN
 * is present.
 */
export function getLdapSettings(): LdapSettings | null {
  const url = process.env.LDAP_URL?.trim();
  const bindDn = process.env.LDAP_BIND_DN?.trim();
  const bindPassword = process.env.LDAP_BIND_PASSWORD;
  const base = process.env.LDAP_BASE?.trim();
  if (!url || !bindDn || !bindPassword || !base) return null;

  const groups = {
    board: process.env.LDAP_GROUP_BOARD?.trim() || undefined,
    candidateBoard: process.env.LDAP_GROUP_CANDIDATE_BOARD?.trim() || undefined,
    keyholder: process.env.LDAP_GROUP_KEYHOLDER?.trim() || undefined,
  };
  if (!groups.board && !groups.candidateBoard && !groups.keyholder) return null;

  const interval = Number(process.env.LDAP_SYNC_INTERVAL_MINUTES ?? 60);
  return {
    url,
    bindDn,
    bindPassword,
    base,
    groups,
    syncIntervalMinutes: Number.isFinite(interval) && interval > 0 ? interval : 0,
  };
}

/**
 * Open and bind an LDAP client, or return null when the bind fails so a broken
 * directory never takes the rest of the application down with it.
 */
export async function getLdapConnection(settings: LdapSettings): Promise<Client | null> {
  const client = new Client({ url: settings.url });
  try {
    await client.bind(settings.bindDn, settings.bindPassword);
    return client;
  } catch (e) {
    logger.error(`Could not bind LDAP reader ${settings.bindDn}: ${String(e)}`);
    await client.unbind().catch(() => {});
    return null;
  }
}

/**
 * Escape the characters that carry meaning inside an LDAP filter (RFC 4515), so
 * a group DN containing a parenthesis cannot change the filter's structure.
 */
export function escapeFilterValue(value: string): string {
  return value.replace(/[\\*()\0]/g, (c) => {
    switch (c) {
      case '\\':
        return '\\5c';
      case '*':
        return '\\2a';
      case '(':
        return '\\28';
      case ')':
        return '\\29';
      default:
        return '\\00';
    }
  });
}

/**
 * Normalise an `objectGUID` to a lower-case hex string — the stable identity of
 * a directory entry, unaffected by renames. AD returns it as a binary Buffer;
 * some directories hand back a string form instead.
 */
export function guidToHex(value: unknown): string | null {
  if (Buffer.isBuffer(value)) return value.toString('hex');
  if (Array.isArray(value) && value.length > 0) return guidToHex(value[0]);
  if (typeof value === 'string' && value.length > 0) {
    // Already textual: strip the braces/dashes of a {xxxx-…} style GUID.
    return value.replace(/[{}-]/g, '').toLowerCase();
  }
  return null;
}

/** Read a single-valued attribute as a trimmed string. */
export function attr(value: unknown): string {
  if (Array.isArray(value)) return attr(value[0]);
  if (Buffer.isBuffer(value)) return value.toString('utf8').trim();
  return typeof value === 'string' ? value.trim() : '';
}
