import axios from 'axios';
import { HttpApiException, HttpStatusCode } from '../../../../helpers/custom-error';

/**
 * A monitor's state, mirroring Uptime Kuma's own statuses (plus `unknown` for a
 * monitor that has not reported yet). The client colours each state the way Kuma
 * does. Gatus only distinguishes success/failure, so it never reports `pending`
 * or `maintenance`.
 */
export type ServiceState = 'up' | 'down' | 'pending' | 'maintenance' | 'unknown';

export interface ServiceStatus {
  name: string;
  /** Fully-qualified host, e.g. "wiki.gewis.nl". */
  host: string;
  state: ServiceState;
}

export interface ServiceGroup {
  name: string;
  /** The worst state among the group's monitors (see STATE_PRECEDENCE). */
  state: ServiceState;
  services: ServiceStatus[];
}

export interface ServicesHealthResponse {
  /** One-line human summary, e.g. "Most services are operational". */
  summary: string;
  groups: ServiceGroup[];
}

/** The monitoring backends a status URL may turn out to be. */
export type HealthProvider = 'uptime-kuma' | 'gatus';

/** Where a configured URL was resolved to, and by which API. */
export interface ResolvedProvider {
  provider: HealthProvider;
  /** Origin (plus any sub-path) the API lives under. */
  base: string;
  /** Uptime Kuma status page slug; unused by Gatus. */
  slug: string;
}

/** The subset of an Uptime Kuma status-page payload that we use. */
export interface KumaMonitor {
  id: number;
  name: string;
  url?: string | null;
}

export interface KumaGroup {
  name: string;
  monitorList?: KumaMonitor[];
}

export interface KumaStatusPage {
  publicGroupList?: KumaGroup[];
}

/** One heartbeat; `status` is 0 down, 1 up, 2 pending, 3 maintenance. */
export interface KumaHeartbeat {
  status: number;
  time?: string;
}

export interface KumaHeartbeats {
  /** Latest heartbeats per monitor id, oldest first. */
  heartbeatList?: Record<string, KumaHeartbeat[] | undefined>;
}

/** The subset of a Gatus `/api/v1/endpoints/statuses` entry that we use. */
export interface GatusResult {
  success?: boolean;
  hostname?: string;
  timestamp?: string;
}

export interface GatusEndpoint {
  name: string;
  /** Gatus leaves this empty for ungrouped endpoints. */
  group?: string;
  /** Recent check results, oldest first. */
  results?: GatusResult[];
}

/** Uptime Kuma's heartbeat status codes. */
const KUMA_STATES: Record<number, ServiceState> = {
  0: 'down',
  1: 'up',
  2: 'pending',
  3: 'maintenance',
};

/** Worst-first, so a group reports the most serious state it contains. */
const STATE_PRECEDENCE: ServiceState[] = ['down', 'pending', 'maintenance', 'unknown', 'up'];

/** The status page used when neither the widget nor the env var names one. */
export const DEFAULT_STATUS_PAGE_URL = 'https://uptime.gewis.nl';

/** Group name for Gatus endpoints that declare no group. */
const UNGROUPED = 'Ungrouped';

/** How many service names the summary spells out before it starts counting. */
const SUMMARY_NAMES = 3;

const TIMEOUT = 10_000;

/**
 * Reports the health of GEWIS services from a status monitoring backend, either
 * **Uptime Kuma** or **Gatus**. Which one a URL is gets detected from the API it
 * actually answers on, so only the URL has to be configured:
 *
 * - Uptime Kuma serves each status page over two unauthenticated endpoints —
 *   `/api/status-page/{slug}` for the groups and their monitors, and
 *   `/api/status-page/heartbeat/{slug}` for recent heartbeats.
 * - Gatus serves every endpoint's recent results from `/api/v1/endpoints/statuses`.
 *
 * Neither needs an API key. Both expose groups, which map onto the widget's
 * service groups one-to-one.
 *
 * The URL comes from the widget's own `statusPageUrl` setting, then the
 * `STATUS_PAGE_URL` env var used for the screen-wide broadcast, and finally
 * {@link DEFAULT_STATUS_PAGE_URL}.
 */
export default class ServicesHealthService {
  /**
   * Detected provider per configured URL. Detection costs a probe request, and
   * a status backend does not change species at runtime, so it is done once and
   * only redone after a failed fetch.
   */
  private static readonly detected = new Map<string, ResolvedProvider>();

  public async getHealth(statusPageUrl?: string): Promise<ServicesHealthResponse> {
    const configured = ServicesHealthService.configuredUrl(statusPageUrl);
    const resolved = await ServicesHealthService.resolve(configured);
    try {
      return resolved.provider === 'gatus'
        ? await ServicesHealthService.fetchGatus(resolved)
        : await ServicesHealthService.fetchKuma(resolved);
    } catch (e) {
      // The backend may have been swapped out behind the same URL; re-detect.
      ServicesHealthService.detected.delete(configured);
      throw e;
    }
  }

  /** Widget setting, else env var, else the GEWIS default. */
  private static configuredUrl(statusPageUrl?: string): string {
    return (statusPageUrl || process.env.STATUS_PAGE_URL || '').trim() || DEFAULT_STATUS_PAGE_URL;
  }

  /** Forget every detected provider (used by tests). */
  public static clearProviderCache(): void {
    ServicesHealthService.detected.clear();
  }

  /**
   * Work out which API a configured URL speaks. An Uptime Kuma status page URL
   * (`.../status/<slug>`) says so by its shape; anything else is probed.
   */
  public static async resolve(configured: string): Promise<ResolvedProvider> {
    const cached = ServicesHealthService.detected.get(configured);
    if (cached) return cached;

    const { base, slug, isKumaStatusPage } = ServicesHealthService.parseUrl(configured);
    const resolved: ResolvedProvider = isKumaStatusPage
      ? { provider: 'uptime-kuma', base, slug }
      : await ServicesHealthService.probe(base, slug);

    ServicesHealthService.detected.set(configured, resolved);
    return resolved;
  }

  /**
   * Ask both APIs at once and keep whichever answers in its own shape. Probing
   * beats guessing from the URL: a bare origin is a valid entry point for both.
   */
  private static async probe(base: string, slug: string): Promise<ResolvedProvider> {
    const [kuma, gatus] = await Promise.allSettled([
      axios.get<KumaStatusPage>(`${base}/api/status-page/${slug}`, { timeout: TIMEOUT }),
      axios.get<GatusEndpoint[]>(`${base}/api/v1/endpoints/statuses`, { timeout: TIMEOUT }),
    ]);

    if (kuma.status === 'fulfilled' && ServicesHealthService.looksLikeKuma(kuma.value.data)) {
      return { provider: 'uptime-kuma', base, slug };
    }
    if (gatus.status === 'fulfilled' && ServicesHealthService.looksLikeGatus(gatus.value.data)) {
      return { provider: 'gatus', base, slug };
    }
    // A plain Error would surface as a bare 500 "Internal server error", which
    // says nothing about the URL being the problem. 502 with the reason is what
    // makes a mistyped status page diagnosable from the screen's own logs.
    throw new HttpApiException(
      HttpStatusCode.BadGateway,
      `${base} does not answer as an Uptime Kuma status page or a Gatus API. ` +
        'Check the URL (an Uptime Kuma page looks like .../status/<slug>).',
    );
  }

  /** A Kuma status page always carries a (possibly empty) publicGroupList. */
  public static looksLikeKuma(data: unknown): data is KumaStatusPage {
    return Array.isArray((data as KumaStatusPage | null)?.publicGroupList);
  }

  /** Gatus answers with a bare array of endpoints, each with a name. */
  public static looksLikeGatus(data: unknown): data is GatusEndpoint[] {
    if (!Array.isArray(data)) return false;
    return data.length === 0 || typeof (data[0] as GatusEndpoint)?.name === 'string';
  }

  /**
   * Split a status URL into the API origin and, for Uptime Kuma, the page slug.
   * `isKumaStatusPage` marks the unambiguous `.../status/<slug>` shape; anything
   * else (typically a bare origin) is left for {@link probe} to identify.
   */
  public static parseUrl(raw: string): { base: string; slug: string; isKumaStatusPage: boolean } {
    let parsed: URL;
    try {
      parsed = new URL(raw.trim());
    } catch {
      throw new Error(`"${raw}" is not a valid URL.`);
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    const statusIndex = segments.indexOf('status');
    if (statusIndex === -1) {
      // A bare origin, or a sub-path that Kuma/Gatus is hosted under.
      const path = segments.join('/');
      return {
        base: path ? `${parsed.origin}/${path}` : parsed.origin,
        slug: 'default',
        isKumaStatusPage: false,
      };
    }

    const slug = segments[statusIndex + 1];
    if (!slug) {
      throw new Error(`"${raw}" is missing the status page slug (expected .../status/<slug>).`);
    }

    // Kuma may live under a sub-path, e.g. https://host/kuma/status/gewis.
    const prefix = segments.slice(0, statusIndex).join('/');
    return {
      base: prefix ? `${parsed.origin}/${prefix}` : parsed.origin,
      slug,
      isKumaStatusPage: true,
    };
  }

  // --- Uptime Kuma ----------------------------------------------------------

  private static async fetchKuma({
    base,
    slug,
  }: ResolvedProvider): Promise<ServicesHealthResponse> {
    const [page, heartbeats] = await Promise.all([
      axios.get<KumaStatusPage>(`${base}/api/status-page/${slug}`, { timeout: TIMEOUT }),
      axios.get<KumaHeartbeats>(`${base}/api/status-page/heartbeat/${slug}`, { timeout: TIMEOUT }),
    ]);
    return ServicesHealthService.transformKuma(page.data, heartbeats.data);
  }

  /**
   * Map an Uptime Kuma status page + its heartbeats onto the widget's shape.
   * Pure, so the mapping is unit tested without a network call.
   *
   * A monitor takes the state of its most recent heartbeat; one that has never
   * reported is `unknown` rather than down, so a freshly added monitor does not
   * read as an outage.
   */
  public static transformKuma(
    page: KumaStatusPage,
    heartbeats: KumaHeartbeats,
  ): ServicesHealthResponse {
    const beats = heartbeats?.heartbeatList ?? {};

    const groups: ServiceGroup[] = (page?.publicGroupList ?? []).map((group) => {
      const services: ServiceStatus[] = (group.monitorList ?? []).map((monitor) => ({
        name: monitor.name,
        host: ServicesHealthService.hostOf(monitor.url, monitor.name),
        state: ServicesHealthService.kumaState(beats[String(monitor.id)]),
      }));
      return {
        name: group.name,
        state: ServicesHealthService.worstState(services.map((s) => s.state)),
        services,
      };
    });

    return { summary: ServicesHealthService.summarize(groups), groups };
  }

  /** The state of a monitor's latest heartbeat. */
  private static kumaState(heartbeats: KumaHeartbeat[] | undefined): ServiceState {
    const latest = heartbeats?.[heartbeats.length - 1];
    if (!latest) return 'unknown';
    return KUMA_STATES[latest.status] ?? 'unknown';
  }

  // --- Gatus ----------------------------------------------------------------

  private static async fetchGatus({ base }: ResolvedProvider): Promise<ServicesHealthResponse> {
    const { data } = await axios.get<GatusEndpoint[]>(`${base}/api/v1/endpoints/statuses`, {
      timeout: TIMEOUT,
    });
    return ServicesHealthService.transformGatus(data);
  }

  /**
   * Map Gatus endpoint statuses onto the widget's shape, grouping by the
   * endpoint's `group`. Pure, so the mapping is unit tested without a network
   * call.
   *
   * Gatus records only whether the last check passed, so an endpoint is `up` or
   * `down` — never pending or under maintenance. One that has produced no result
   * yet is `unknown`, matching how a fresh Kuma monitor is treated.
   */
  public static transformGatus(endpoints: GatusEndpoint[]): ServicesHealthResponse {
    // A Map keeps the groups in the order Gatus listed them.
    const byGroup = new Map<string, ServiceStatus[]>();

    for (const endpoint of endpoints ?? []) {
      const latest = endpoint.results?.[endpoint.results.length - 1];
      const service: ServiceStatus = {
        name: endpoint.name,
        host: ServicesHealthService.hostOf(latest?.hostname, endpoint.name),
        // eslint-disable-next-line no-nested-ternary
        state: latest === undefined ? 'unknown' : latest.success ? 'up' : 'down',
      };
      const group = endpoint.group?.trim() || UNGROUPED;
      const existing = byGroup.get(group);
      if (existing) existing.push(service);
      else byGroup.set(group, [service]);
    }

    const groups: ServiceGroup[] = [...byGroup].map(([name, services]) => ({
      name,
      state: ServicesHealthService.worstState(services.map((s) => s.state)),
      services,
    }));

    return { summary: ServicesHealthService.summarize(groups), groups };
  }

  // --- shared ---------------------------------------------------------------

  /** The most serious of the given states; `up` when there are none. */
  public static worstState(states: ServiceState[]): ServiceState {
    return STATE_PRECEDENCE.find((s) => states.includes(s)) ?? 'up';
  }

  /** Prefer the monitored URL's hostname, falling back to the monitor name. */
  private static hostOf(url: string | null | undefined, fallback: string): string {
    if (!url) return fallback;
    try {
      return new URL(url).hostname;
    } catch {
      // Not a URL (a TCP/ping/ICMP monitor stores a bare host) — use it as-is.
      return url;
    }
  }

  /**
   * The one-line status shown above the board. When something is wrong it names
   * the services rather than saying how many, since "Wiki is down" is what a
   * passer-by actually needs; past {@link SUMMARY_NAMES} names it falls back to
   * counting the rest so the line stays one line.
   */
  public static summarize(groups: ServiceGroup[]): string {
    const services = groups.flatMap((g) => g.services);
    if (services.length === 0) return 'No services are being monitored';

    const down = services.filter((s) => s.state === 'down');
    if (down.length === services.length) return 'All services are offline';
    if (down.length > 0) return `${ServicesHealthService.subject(down)} down`;

    // Nothing is down, but something may still be under maintenance or pending.
    const maintenance = services.filter((s) => s.state === 'maintenance');
    if (maintenance.length > 0) {
      return `${ServicesHealthService.subject(maintenance)} under maintenance`;
    }
    if (services.every((s) => s.state === 'up')) return 'All services are operational';
    return 'Most services are operational';
  }

  /**
   * The subject of the summary sentence, with its verb so the caller only adds
   * the state: `"Wiki is"`, `"Wiki and Mail are"`, `"Wiki, Mail and Vault are"`,
   * `"Wiki, Mail, Vault and 4 others are"`.
   */
  private static subject(services: ServiceStatus[]): string {
    const names = services.map((s) => s.name);
    const shown: string[] = names.slice(0, SUMMARY_NAMES);
    const hidden = names.length - shown.length;
    if (hidden > 0) shown.push(`${hidden} other${hidden === 1 ? '' : 's'}`);

    const list =
      shown.length === 1
        ? shown[0]
        : `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
    return `${list} ${names.length === 1 ? 'is' : 'are'}`;
  }
}
