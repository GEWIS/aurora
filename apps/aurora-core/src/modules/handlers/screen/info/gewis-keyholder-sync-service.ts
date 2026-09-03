import axios from 'axios';
import Keyholder from './entities/keyholder';
import logger from '../../../../logger';

/** A member from the GEWIS API, reduced to what the keyholder registry stores. */
export interface GewisKeyholder {
  /** Membership number — the row's identity. */
  lidnr: number;
  name: string;
  isBoard: boolean;
  isKeyholder: boolean;
}

/** What a run would do, or did. */
export interface KeyholderSyncResult {
  created: number;
  updated: number;
  removed: number;
  /** Entries dropped because they carry no membership number or no name. */
  skipped: number;
}

/** Whether this deployment can sync at all, for the backoffice's sync button. */
export interface KeyholderSyncStatus {
  /** True when the API key is configured. */
  enabled: boolean;
  /** Minutes between automatic runs; 0 when it only runs at startup. */
  intervalMinutes: number;
}

/** The reconciliation between the API and the local registry. */
export interface KeyholderSyncPlan {
  create: GewisKeyholder[];
  update: { local: Keyholder; remote: GewisKeyholder }[];
  remove: Keyholder[];
}

/** One page of an API Platform collection, unwrapped from its envelope. */
interface Page<T> {
  data: T[];
  totalPages: number;
}

interface KeyholderRecord {
  lidnr: number;
  full_name: string;
  current: boolean;
}

interface BoardRecord {
  lidnr: number;
  full_name: string;
  current: boolean;
}

const GEWIS_API = 'https://gewis.nl/api';

/** The contract version the endpoints used here were introduced in. */
const API_VERSION = '5.0.0';

/** The API's own maximum; fewer requests for the same registry. */
const ITEMS_PER_PAGE = 500;

/** Refuse to page forever if the API keeps claiming there is more. */
const MAX_PAGES = 20;

const DEFAULT_SYNC_INTERVAL_MINUTES = 60;

/**
 * Syncs the keyholder registry from the GEWIS API (GEWISDB), which replaced the
 * Active Directory groups this used to read: `/keyholders` for who currently
 * holds a key and `/boards` for who is currently on the board. The registry is
 * the **union** of the two, so a board member without a key is still listed.
 *
 * Two fields are deliberately **not** taken from the API, because the API has no
 * notion of them and overwriting them would silently discard backoffice work:
 *
 * - `isCandidateBoard` — no such concept in the API; a backoffice toggle.
 * - `photoUrl` — never part of the directory's state.
 */
export default class GewisKeyholderSyncService {
  private skipped = 0;

  public constructor(
    private readonly apiKey: string,
    private readonly syncIntervalMinutes: number,
  ) {}

  /** Build a service from the environment, or null when no API key is set. */
  public static fromEnv(): GewisKeyholderSyncService | null {
    const key = process.env.GEWIS_KEY;
    if (!key) return null;
    return new GewisKeyholderSyncService(key, GewisKeyholderSyncService.intervalMinutes());
  }

  private static intervalMinutes(): number {
    const parsed = parseInt(process.env.GEWIS_SYNC_INTERVAL_MINUTES || '', 10);
    return Number.isNaN(parsed) ? DEFAULT_SYNC_INTERVAL_MINUTES : parsed;
  }

  /** Whether a sync can be run here, and how often it runs by itself. */
  public static status(): KeyholderSyncStatus {
    return {
      enabled: !!process.env.GEWIS_KEY,
      intervalMinutes: GewisKeyholderSyncService.intervalMinutes(),
    };
  }

  /**
   * Run once at startup and then every `GEWIS_SYNC_INTERVAL_MINUTES`. A failing
   * run only logs, so an API outage never stops the schedule.
   */
  public schedule(): NodeJS.Timeout | null {
    const run = () => {
      this.run().catch((e) => logger.error(e));
    };
    run();
    if (this.syncIntervalMinutes <= 0) return null;
    const timer = setInterval(run, this.syncIntervalMinutes * 60_000);
    // Do not hold the process open for the sake of the sync timer.
    timer.unref?.();
    return timer;
  }

  /**
   * Run one full sync. Returns what changed, or null when the API could not be
   * read (in which case nothing is touched).
   */
  public async run(dryRun = false): Promise<KeyholderSyncResult | null> {
    this.skipped = 0;
    try {
      const remote = await this.fetch();

      // Guard rail for the "delete anything the API does not account for"
      // policy: an empty result is far more likely a revoked token or a
      // half-broken endpoint than every keyholder having left at once, and
      // acting on it would wipe the registry. Refuse the run instead.
      if (remote.length === 0) {
        logger.warn(
          'GEWIS keyholder sync: the API returned no keyholders and no board members; ' +
            'refusing to empty the registry. Check GEWIS_KEY and its permissions.',
        );
        return null;
      }

      const local = await Keyholder.find();
      const plan = GewisKeyholderSyncService.plan(remote, local);

      if (!dryRun) {
        await Promise.all(plan.create.map((r) => GewisKeyholderSyncService.sync(r)));
        await Promise.all(
          plan.update.map(({ local: l, remote: r }) => GewisKeyholderSyncService.sync(r, l)),
        );
        await Promise.all(plan.remove.map((l) => GewisKeyholderSyncService.down(l)));
      }

      const result: KeyholderSyncResult = {
        created: plan.create.length,
        updated: plan.update.length,
        removed: plan.remove.length,
        skipped: this.skipped,
      };
      logger.info(
        `GEWIS keyholder sync${dryRun ? ' (dry run)' : ''}: ` +
          `${result.created} created, ${result.updated} updated, ` +
          `${result.removed} removed, ${result.skipped} skipped.`,
      );
      return result;
    } catch (e) {
      logger.error(`GEWIS keyholder sync failed: ${String(e)}`);
      return null;
    }
  }

  /**
   * Read both endpoints and merge them into one entry per member, OR-ing the
   * flags so somebody who is both a keyholder and on the board gets both.
   */
  public async fetch(): Promise<GewisKeyholder[]> {
    const [keyholders, boards] = await Promise.all([
      this.collect<KeyholderRecord>('/keyholders'),
      this.collect<BoardRecord>('/boards'),
    ]);

    const merged = new Map<number, GewisKeyholder>();
    const add = (record: KeyholderRecord | BoardRecord, flag: 'isBoard' | 'isKeyholder') => {
      // Both endpoints list only what is in force today, but `current` is what
      // says so; honour it rather than trusting the default.
      if (!record.current) return;
      const person: GewisKeyholder = {
        lidnr: record.lidnr,
        name: (record.full_name ?? '').trim(),
        isBoard: flag === 'isBoard',
        isKeyholder: flag === 'isKeyholder',
      };
      if (!GewisKeyholderSyncService.guard(person)) {
        this.skipped += 1;
        return;
      }
      merged.set(
        person.lidnr,
        GewisKeyholderSyncService.mergeFlags(merged.get(person.lidnr), person),
      );
    };

    keyholders.forEach((k) => add(k, 'isKeyholder'));
    boards.forEach((b) => add(b, 'isBoard'));
    return [...merged.values()];
  }

  /** Every record of a paged collection, following `meta.totalPages`. */
  private async collect<T>(path: string): Promise<T[]> {
    const records: T[] = [];
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages && page <= MAX_PAGES) {
      // Sequential: the page count is only known once the first page is in.
      // eslint-disable-next-line no-await-in-loop
      const result = await this.get<T>(path, page);
      records.push(...result.data);
      totalPages = result.totalPages;
      page += 1;
    }
    return records;
  }

  /** One page, unwrapped from the `{ status, data, meta }` envelope. */
  private async get<T>(path: string, page: number): Promise<Page<T>> {
    const response = await axios.get(`${GEWIS_API}${path}`, {
      params: { page, itemsPerPage: ITEMS_PER_PAGE },
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Api-Version': API_VERSION,
      },
    });
    return {
      data: Array.isArray(response.data?.data) ? (response.data.data as T[]) : [],
      totalPages: Number(response.data?.meta?.totalPages) || 1,
    };
  }

  /** An entry is only usable when it has both an identity and a name to show. */
  public static guard(person: GewisKeyholder): boolean {
    return Number.isInteger(person.lidnr) && person.lidnr > 0 && person.name.length > 0;
  }

  /**
   * The candidate-board flag a row should keep. Installing a candidate board as
   * the board clears it; otherwise the backoffice's value stands.
   */
  public static candidateBoardAfterSync(current: boolean, isBoard: boolean): boolean {
    return isBoard ? false : current;
  }

  /** OR the flags of the same member found in the other endpoint. */
  public static mergeFlags(
    existing: GewisKeyholder | undefined,
    incoming: GewisKeyholder,
  ): GewisKeyholder {
    if (!existing) return incoming;
    return {
      ...existing,
      isBoard: existing.isBoard || incoming.isBoard,
      isKeyholder: existing.isKeyholder || incoming.isKeyholder,
    };
  }

  /**
   * Reconcile the API against the registry. Pure, so the policy is unit tested
   * without touching the network.
   *
   * A local row is matched by membership number first. A row that has none
   * (added by hand in the backoffice) but whose name matches is **adopted**
   * rather than deleted and recreated — that keeps its backoffice-managed
   * `photoUrl`, which the sync never provides. Everything still unmatched is
   * removed, per the "the API is the sole authority" policy.
   */
  public static plan(remote: GewisKeyholder[], local: Keyholder[]): KeyholderSyncPlan {
    const byMember = new Map(local.filter((k) => k.memberId !== null).map((k) => [k.memberId!, k]));
    const byName = new Map(
      local.filter((k) => k.memberId === null).map((k) => [k.name.trim().toLowerCase(), k]),
    );

    const plan: KeyholderSyncPlan = { create: [], update: [], remove: [] };
    const matched = new Set<number>();

    for (const person of remote) {
      const existing = byMember.get(person.lidnr) ?? byName.get(person.name.trim().toLowerCase());
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
   * Write one member to the registry, creating the row or updating the one it
   * was matched to.
   *
   * The API owns the name, `isBoard` and `isKeyholder`: they follow the records
   * it keeps and are always overwritten, so the screen cannot drift from what
   * the association's own administration says. `photoUrl` is never written.
   *
   * `isCandidateBoard` is a backoffice toggle the API knows nothing about, with
   * one exception: a candidate board that gets installed becomes the board, and
   * nobody would think to untick the box. Clearing it here keeps a row from
   * claiming both, which would otherwise sit there until the next election.
   */
  private static async sync(person: GewisKeyholder, existing?: Keyholder): Promise<void> {
    const keyholder = existing ?? Keyholder.create({ photoUrl: null });

    keyholder.name = person.name;
    keyholder.memberId = person.lidnr;
    keyholder.isBoard = person.isBoard;
    keyholder.isKeyholder = person.isKeyholder;
    keyholder.isCandidateBoard = GewisKeyholderSyncService.candidateBoardAfterSync(
      keyholder.isCandidateBoard ?? false,
      person.isBoard,
    );
    await keyholder.save();
  }

  /** Remove a row the API no longer accounts for. */
  private static async down(keyholder: Keyholder): Promise<void> {
    logger.info(`GEWIS keyholder sync: removing "${keyholder.name}" (no longer a keyholder).`);
    await keyholder.remove();
  }
}
