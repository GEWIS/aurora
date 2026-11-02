import { NetbirdPeerState, NetbirdPeerStatus } from '@gewis/aurora-api-client';
import VerticalScroll from '../../../components/VerticalScroll';
import { sStr, WidgetSettings } from '../settings';

interface Props {
  peers: NetbirdPeerStatus[];
  settings?: WidgetSettings;
}

/** The services widget's up/pending/unknown colours, so both boards read alike. */
const STATE_COLORS: Record<NetbirdPeerState, string> = {
  [NetbirdPeerState.CONNECTED]: '#5cdd8b',
  [NetbirdPeerState.CONNECTING]: '#f8a306',
  [NetbirdPeerState.OFFLINE]: '#aaaaaa',
};

interface Row {
  key: string;
  name: string;
  state: NetbirdPeerState;
}

/**
 * Every peer by name when nothing is configured; otherwise one row per
 * configured entry, in the configured order. An entry that matches no peer is
 * shown offline, so a typo or a peer hidden by an access policy stays visible.
 */
function peerRows(peers: NetbirdPeerStatus[], setting: string): Row[] {
  const entries = [
    ...new Set(
      setting
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  if (entries.length === 0) {
    return [...peers]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ key: p.fqdn, name: p.name, state: p.state }));
  }
  return entries.map((entry) => {
    // An entry names a peer by its full FQDN or its leading labels ("pc-1" for
    // "pc-1.netbird.cloud"), case-insensitively. A bare prefix such as "pc" does
    // not match, so "pc" and "pc-1" stay distinct peers.
    const e = entry.toLowerCase();
    const peer = peers.find((p) => {
      const fqdn = p.fqdn.toLowerCase();
      return fqdn === e || fqdn.startsWith(`${e}.`);
    });
    return {
      key: entry,
      name: peer?.name ?? entry,
      state: peer?.state ?? NetbirdPeerState.OFFLINE,
    };
  });
}

/**
 * NetBird mesh peers as seen from the Aurora host, each with a green
 * (connected), orange (connecting) or gray (offline) dot. Content that does not
 * fit the panel scrolls by itself.
 */
export default function NetbirdWidget({ peers, settings }: Props) {
  const rows = peerRows(peers, sStr(settings, 'peers', ''));

  if (rows.length === 0) {
    return <div className="font-raleway text-2xl text-white/60">No NetBird peers</div>;
  }

  return (
    <div className="h-full min-h-0 font-raleway text-white text-shadow">
      <VerticalScroll visible items={rows.length} scrollEmptySpace>
        <div className="flex flex-col gap-1">
          {rows.map((row) => (
            <div key={row.key} data-status={row.state} className="flex items-center gap-2 text-xl">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: STATE_COLORS[row.state] }}
              />
              <span className="truncate">{row.name}</span>
            </div>
          ))}
        </div>
      </VerticalScroll>
    </div>
  );
}
