import { Client, Entry } from 'ldapts';
import Keyholder from './entities/keyholder';
import logger from '../../../../logger';
import {
  LDAP_MATCHING_RULE_IN_CHAIN,
  LdapSettings,
  attr,
  escapeFilterValue,
  getLdapConnection,
  getLdapSettings,
  guidToHex,
} from '../../../../helpers/ldap';

/** A directory entry reduced to what the keyholder registry stores. */
export interface LdapKeyholder {
  /** objectGUID as hex — the row's identity. */
  guid: string;
  name: string;
  usernames: string[];
  isBoard: boolean;
  isCandidateBoard: boolean;
  isKeyholder: boolean;
}

/** Which flag a configured group grants its (transitive) members. */
export type KeyholderFlag = 'isBoard' | 'isCandidateBoard' | 'isKeyholder';

/** What a run would do, or did. */
export interface KeyholderSyncResult {
  created: number;
  updated: number;
  removed: number;
  /** Entries dropped because they carry no GUID or no display name. */
  skipped: number;
}

/** Whether this deployment can sync at all, for the backoffice's sync button. */
export interface KeyholderSyncStatus {
  /** True when the LDAP connection variables and a group DN are configured. */
  enabled: boolean;
  /** Minutes between automatic runs; 0 when it only runs at startup. */
  intervalMinutes: number;
}

/** The reconciliation between the directory and the local registry. */
export interface KeyholderSyncPlan {
  create: LdapKeyholder[];
  update: { local: Keyholder; remote: LdapKeyholder }[];
  remove: Keyholder[];
}

/** Attributes fetched per member. */
const ATTRIBUTES = ['objectGUID', 'displayName', 'cn', 'sAMAccountName', 'uid'];

/**
 * Syncs the keyholder registry from LDAP/Active Directory, modelled on SudoSOS'
 * `LdapSyncService`: a `pre` → `fetch` → `sync`/`down` → `post` lifecycle with a
 * `guard` that drops entries which cannot be represented locally.
 *
 * The registry is the **union of three configured groups** — board, candidate
 * board and keyholder — and a person's membership of each grants the matching
 * flag, so somebody in two groups gets both. Group membership is resolved
 * transitively (AD's LDAP_MATCHING_RULE_IN_CHAIN), so nesting a committee inside
 * a group still yields its people.
 *
 * `photoUrl` is deliberately **not** synced: it stays backoffice-managed.
 */
export default class LdapKeyholderSyncService {
  private client: Client | null = null;

  public constructor(private readonly settings: LdapSettings) {}

  /**
   * Build a service from the environment, or null when LDAP is not configured.
   */
  public static fromEnv(): LdapKeyholderSyncService | null {
    const settings = getLdapSettings();
    return settings ? new LdapKeyholderSyncService(settings) : null;
  }

  /** Whether a sync can be run here, and how often it runs by itself. */
  public static status(): KeyholderSyncStatus {
    const settings = getLdapSettings();
    return {
      enabled: settings !== null,
      intervalMinutes: settings?.syncIntervalMinutes ?? 0,
    };
  }

  /**
   * Run once at startup and then every `LDAP_SYNC_INTERVAL_MINUTES`. A failing
   * run only logs, so a directory outage never stops the schedule.
   */
  public schedule(): NodeJS.Timeout | null {
    const run = () => {
      this.run().catch((e) => logger.error(e));
    };
    run();
    if (this.settings.syncIntervalMinutes <= 0) return null;
    const timer = setInterval(run, this.settings.syncIntervalMinutes * 60_000);
    // Do not hold the process open for the sake of the sync timer.
    timer.unref?.();
    return timer;
  }

  /**
   * Run one full sync. Returns what changed, or null when the directory could
   * not be read (in which case nothing is touched).
   */
  public async run(dryRun = false): Promise<KeyholderSyncResult | null> {
    if (!(await this.pre())) return null;
    try {
      const remote = await this.fetch();

      // Guard rail for the "delete anything not in LDAP" policy: an empty
      // directory result is far more likely a misconfigured group DN or a
      // half-broken bind than every keyholder having left at once, and acting
      // on it would wipe the registry. Refuse the run instead.
      if (remote.length === 0) {
        logger.warn(
          'LDAP keyholder sync: the configured groups returned no members; ' +
            'refusing to empty the registry. Check LDAP_GROUP_* and the bind account.',
        );
        return null;
      }

      const local = await Keyholder.find();
      const plan = LdapKeyholderSyncService.plan(remote, local);

      if (!dryRun) {
        await Promise.all(plan.create.map((r) => this.sync(r)));
        await Promise.all(plan.update.map(({ local: l, remote: r }) => this.sync(r, l)));
        await Promise.all(plan.remove.map((l) => this.down(l)));
      }

      const result: KeyholderSyncResult = {
        created: plan.create.length,
        updated: plan.update.length,
        removed: plan.remove.length,
        skipped: this.skipped,
      };
      logger.info(
        `LDAP keyholder sync${dryRun ? ' (dry run)' : ''}: ` +
          `${result.created} created, ${result.updated} updated, ` +
          `${result.removed} removed, ${result.skipped} skipped.`,
      );
      return result;
    } catch (e) {
      logger.error(`LDAP keyholder sync failed: ${String(e)}`);
      return null;
    } finally {
      await this.post();
    }
  }

  private skipped = 0;

  /** Open the connection. False when the bind failed. */
  private async pre(): Promise<boolean> {
    this.skipped = 0;
    this.client = await getLdapConnection(this.settings);
    return this.client !== null;
  }

  /** Close the connection; safe to call when the bind never succeeded. */
  private async post(): Promise<void> {
    await this.client?.unbind().catch(() => {});
    this.client = null;
  }

  /**
   * Read the three groups and merge them into one entry per person, OR-ing the
   * flags of every group they are in.
   */
  public async fetch(): Promise<LdapKeyholder[]> {
    const groups: [KeyholderFlag, string | undefined][] = [
      ['isBoard', this.settings.groups.board],
      ['isCandidateBoard', this.settings.groups.candidateBoard],
      ['isKeyholder', this.settings.groups.keyholder],
    ];

    const merged = new Map<string, LdapKeyholder>();
    for (const [flag, dn] of groups) {
      if (!dn) continue;
      // Sequential rather than parallel: one bound client, one search at a time.
      // eslint-disable-next-line no-await-in-loop
      const entries = await this.searchGroupMembers(dn);
      for (const entry of entries) {
        const person = LdapKeyholderSyncService.toKeyholder(entry, flag);
        if (!LdapKeyholderSyncService.guard(person)) {
          this.skipped += 1;
          continue;
        }
        merged.set(
          person.guid,
          LdapKeyholderSyncService.mergeFlags(merged.get(person.guid), person),
        );
      }
    }
    return [...merged.values()];
  }

  /** Every person that is transitively a member of the given group DN. */
  private async searchGroupMembers(groupDn: string): Promise<Entry[]> {
    const filter =
      '(&(objectClass=user)(objectCategory=person)' +
      `(memberOf:${LDAP_MATCHING_RULE_IN_CHAIN}:=${escapeFilterValue(groupDn)}))`;
    const { searchEntries } = await this.client!.search(this.settings.base, {
      scope: 'sub',
      filter,
      attributes: ATTRIBUTES,
      explicitBufferAttributes: ['objectGUID'],
    });
    return searchEntries;
  }

  /**
   * Map one directory entry onto the registry's shape, granting the flag of the
   * group it was found in. `displayName` is preferred over `cn` for the shown
   * name; the login names are what PC-usage reports are matched against.
   */
  public static toKeyholder(entry: Entry, flag: KeyholderFlag): LdapKeyholder {
    const usernames = [attr(entry.sAMAccountName), attr(entry.uid)]
      .map((u) => u.toLowerCase())
      .filter(Boolean);

    return {
      guid: guidToHex(entry.objectGUID) ?? '',
      name: attr(entry.displayName) || attr(entry.cn),
      usernames: [...new Set(usernames)],
      isBoard: flag === 'isBoard',
      isCandidateBoard: flag === 'isCandidateBoard',
      isKeyholder: flag === 'isKeyholder',
    };
  }

  /** An entry is only usable when it has both an identity and a name to show. */
  public static guard(person: LdapKeyholder): boolean {
    return person.guid.length > 0 && person.name.length > 0;
  }

  /** OR the flags of the same person found in a second group. */
  public static mergeFlags(
    existing: LdapKeyholder | undefined,
    incoming: LdapKeyholder,
  ): LdapKeyholder {
    if (!existing) return incoming;
    return {
      ...existing,
      usernames: [...new Set([...existing.usernames, ...incoming.usernames])],
      isBoard: existing.isBoard || incoming.isBoard,
      isCandidateBoard: existing.isCandidateBoard || incoming.isCandidateBoard,
      isKeyholder: existing.isKeyholder || incoming.isKeyholder,
    };
  }

  /**
   * Reconcile the directory against the registry. Pure, so the policy is unit
   * tested without a directory.
   *
   * A local row is matched by GUID first. A row that has no GUID (added by hand
   * in the backoffice) but whose name matches a directory entry is **adopted**
   * rather than deleted and recreated — that keeps its backoffice-managed
   * `photoUrl`, which the sync never provides. Everything still unmatched is
   * removed, per the configured "LDAP is the sole authority" policy.
   */
  public static plan(remote: LdapKeyholder[], local: Keyholder[]): KeyholderSyncPlan {
    const byGuid = new Map(local.filter((k) => k.ldapGuid).map((k) => [k.ldapGuid!, k]));
    const byName = new Map(
      local.filter((k) => !k.ldapGuid).map((k) => [k.name.trim().toLowerCase(), k]),
    );

    const plan: KeyholderSyncPlan = { create: [], update: [], remove: [] };
    const matched = new Set<number>();

    for (const person of remote) {
      const existing = byGuid.get(person.guid) ?? byName.get(person.name.trim().toLowerCase());
      if (existing) {
        matched.add(existing.id);
        plan.update.push({ local: existing, remote: person });
      } else {
        plan.create.push(person);
      }
    }

    plan.remove = local.filter((k) => !matched.has(k.id));
    return plan;
  }

  /**
   * Whether this row's name was changed in the backoffice, in which case the
   * sync must not overwrite it. A row whose name still equals the last value the
   * directory reported has not been touched.
   */
  public static nameIsOverridden(keyholder: Pick<Keyholder, 'name' | 'ldapName'>): boolean {
    return keyholder.ldapName !== null && keyholder.name !== keyholder.ldapName;
  }

  /**
   * Write one directory entry to the registry, creating the row or updating the
   * one it was matched to.
   *
   * The directory owns the login names and the three flags — they follow group
   * membership and are always overwritten. `name` is only written when it has
   * not been overridden in the backoffice, and `photoUrl` is never written; both
   * are restored from `ldapName` by an explicit revert.
   */
  private async sync(person: LdapKeyholder, existing?: Keyholder): Promise<void> {
    const keyholder = existing ?? Keyholder.create({ photoUrl: null });

    if (!existing || !LdapKeyholderSyncService.nameIsOverridden(keyholder)) {
      keyholder.name = person.name;
    }
    keyholder.ldapName = person.name;
    keyholder.ldapGuid = person.guid;
    keyholder.usernames = person.usernames;
    keyholder.isBoard = person.isBoard;
    keyholder.isCandidateBoard = person.isCandidateBoard;
    keyholder.isKeyholder = person.isKeyholder;
    await keyholder.save();
  }

  /** Remove a row the directory no longer accounts for. */
  private async down(keyholder: Keyholder): Promise<void> {
    logger.info(`LDAP keyholder sync: removing "${keyholder.name}" (no longer in LDAP).`);
    await keyholder.remove();
  }
}
