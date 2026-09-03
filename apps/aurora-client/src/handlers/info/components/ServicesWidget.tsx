import { getInfoServices, ServicesHealthResponse, ServiceState } from '@gewis/aurora-api-client';
import VerticalScroll from '../../../components/VerticalScroll';
import { sBool, sStr, WidgetSettings } from '../settings';
import useCachedResource from '../useCachedResource';

interface Props {
  services: ServicesHealthResponse | null;
  settings?: WidgetSettings;
}

/**
 * Uptime Kuma's own status colours (its `src/assets/vars.scss`), so the screen
 * reads the same as the status page it mirrors. `unknown` uses Kuma's muted
 * secondary text colour.
 */
const STATE_COLORS: Record<ServiceState, string> = {
  [ServiceState.UP]: '#5cdd8b',
  [ServiceState.DOWN]: '#dc2626',
  [ServiceState.PENDING]: '#f8a306',
  [ServiceState.MAINTENANCE]: '#1747f5',
  [ServiceState.UNKNOWN]: '#aaaaaa',
};

function Dot({ state }: { state: ServiceState }) {
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 rounded-full"
      style={{ backgroundColor: STATE_COLORS[state] }}
    />
  );
}

/**
 * GEWIS services health board, backed by an Uptime Kuma or Gatus instance: a
 * one-line summary and every service group with a health dot, each unfolded to
 * list its individual services. `onlyOffline` narrows that to the groups that
 * are not fully up, leaving healthy ones as a single line. Content that does not
 * fit the panel scrolls by itself.
 */
export default function ServicesWidget({ services: broadcast, settings }: Props) {
  // Unfold every group, or only the ones that need attention.
  const onlyOffline = sBool(settings, 'onlyOffline', false);
  const showSummary = sBool(settings, 'showSummary', true);
  const statusPageUrl = sStr(settings, 'statusPageUrl', '');

  // Self-fetch from the configured status page (per-widget setting), so several
  // widgets can watch different Uptime Kuma pages. Without one the widget
  // follows the deployment-wide health the core broadcasts.
  //
  // The broadcast is only a sensible starting value while this widget is
  // actually following it. A widget pointed at its own status page must start
  // empty instead: painting the deployment-wide health first would show one
  // status page's services under another page's heading until the first
  // response lands, and it is indistinguishable from the real thing.
  const services = useCachedResource<ServicesHealthResponse | null>(
    statusPageUrl ? `services:${statusPageUrl}` : null,
    async () => (await getInfoServices({ query: { url: statusPageUrl } })).data,
    60_000,
    statusPageUrl ? null : broadcast,
  );

  if (!services) {
    return <div className="font-raleway text-2xl text-white/60">Services unavailable</div>;
  }

  const { groups } = services;
  const unfolded = (state: ServiceState) => !onlyOffline || state !== ServiceState.UP;
  // Rendered rows, so the scroller restarts when folding/unfolding changes what
  // there is to scroll through.
  const rows = groups.reduce((n, g) => n + 1 + (unfolded(g.state) ? g.services.length : 0), 0);

  return (
    <div className="flex h-full min-h-0 flex-col font-raleway text-white text-shadow">
      {showSummary && (
        <div className="mb-3 shrink-0 text-2xl font-semibold">{services.summary}</div>
      )}
      <div className="min-h-0 flex-1">
        <VerticalScroll visible items={rows} scrollEmptySpace>
          <div className="flex flex-col gap-2">
            {groups.map((group) => (
              <div key={group.name}>
                <div className="flex items-center gap-2 text-xl">
                  <Dot state={group.state} />
                  <span className={group.state === ServiceState.UP ? '' : 'font-semibold'}>
                    {group.name}
                  </span>
                </div>
                {unfolded(group.state) && (
                  <div className="ml-6 mt-1 flex flex-col gap-1">
                    {group.services.map((s) => (
                      <div key={s.host} className="flex items-center gap-2 text-lg opacity-80">
                        <Dot state={s.state} />
                        <span>{s.host}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </VerticalScroll>
      </div>
    </div>
  );
}
