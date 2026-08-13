import { PcStatusResponse, PcStatusType } from '@gewis/aurora-api-client';
import {
  faKey,
  faStar,
  faStarHalfStroke,
  faWrench,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { sBool, sStr, WidgetSettings } from '../settings';

interface Props {
  pcs: PcStatusResponse[];
  settings?: WidgetSettings;
}

const STATUS_FILL: Record<PcStatusType, string> = {
  [PcStatusType.FREE]: '#96ed91',
  [PcStatusType.IN_USE]: '#f29191',
  [PcStatusType.LOCKED]: '#f39c12',
  [PcStatusType.REMOTE]: '#0078d7',
  [PcStatusType.OFFLINE]: '#787878',
  [PcStatusType.MAINTENANCE]: '#5b5b5b',
};

/**
 * PC node centres in the 830×350 room coordinate space, matching the legacy
 * infoscherm floor plan (images/map_room.svg + the coordinates in pcuse.php).
 * `labelAbove` mirrors the original: bottom-bank labels sit above the desk,
 * top-bank labels below it.
 */
const PC_NODES: Record<string, { x: number; y: number; labelAbove: boolean }> = {
  '1': { x: 632, y: 319, labelAbove: true },
  '2': { x: 531, y: 319, labelAbove: true },
  '3': { x: 426, y: 319, labelAbove: true },
  '4': { x: 296, y: 319, labelAbove: true },
  '5': { x: 181, y: 319, labelAbove: true },
  '6': { x: 70, y: 319, labelAbove: true },
  '7': { x: 70, y: 29, labelAbove: false },
  '8': { x: 200, y: 29, labelAbove: false },
  '9': { x: 331, y: 29, labelAbove: false },
  '10': { x: 461, y: 29, labelAbove: false },
};

const R = 21;

/** Names the vdesktop list has room for before it starts counting the rest. */
const VDESKTOP_ROWS = 5;

function lockedDuration(lockedAt: string | null): string {
  if (!lockedAt) return '';
  const minutes = Math.floor((Date.now() - new Date(lockedAt).getTime()) / 60000);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h` : `${minutes}m`;
}

/**
 * Map the server keyholder symbol to the same FontAwesome icons the room
 * responsible widget uses, so the two stay consistent.
 */
function symbolIcon(symbol: string): IconDefinition | null {
  switch (symbol) {
    case '★':
      return faStar; // board
    case '🍭':
      return faKey; // candidate board + keyholder
    case '🔑':
      return faKey; // keyholder
    case '🍬':
      return faStarHalfStroke; // candidate board
    default:
      return null;
  }
}

/** Render a FontAwesome icon as an SVG path centred at (cx, cy). */
function SvgIcon({
  icon,
  cx,
  cy,
  size,
  fill,
}: {
  icon: IconDefinition;
  cx: number;
  cy: number;
  size: number;
  fill: string;
}) {
  const [w, h, , , path] = icon.icon;
  const d = Array.isArray(path) ? path[0] : path;
  const scale = size / Math.max(w, h);
  return (
    <path
      d={d}
      fill={fill}
      transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-w / 2} ${-h / 2})`}
    />
  );
}

export default function PcUsageMap({ pcs, settings }: Props) {
  const pcStyle = sStr(settings, 'pcStyle', 'circle');
  const showUsernames = sBool(settings, 'showUsernames', true);
  const showVdesktops = sBool(settings, 'showVdesktops', true);

  const byId = new Map(pcs.map((pc) => [pc.pcId, pc]));
  // The virtual desktop is a single PC that many people share, so its users are
  // listed rather than drawn as seats in the room.
  const vdesktopUsers = pcs
    .filter((pc) => !PC_NODES[pc.pcId] && pc.status !== PcStatusType.OFFLINE)
    .flatMap((pc) => pc.users);
  const shownUsers = vdesktopUsers.slice(0, VDESKTOP_ROWS);
  const hiddenUsers = vdesktopUsers.length - shownUsers.length;

  return (
    <svg
      viewBox="0 0 830 350"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full font-raleway"
    >
      {/* Room outline, ported from the legacy map_room.svg. */}
      <g fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
        <path d="M9 3 H818 V345 H690" />
        <path d="M690 345 H9 V3" />
        <path d="M690 345 V292" />
        <path d="M691 293 H9" />
        <path d="M524 3 V159" />
        <path d="M9 56 H524" />
        <rect x="155.9" y="158.5" width="662.7" height="37.8" rx="2" />
        <rect x="8.7" y="114.5" width="37" height="125.8" rx="2" />
      </g>

      {/* PC nodes. */}
      {Object.entries(PC_NODES).map(([id, node]) => {
        const pc = byId.get(id);
        const status = pc?.status ?? PcStatusType.OFFLINE;

        // The node shows an icon (maintenance / keyholder) or text (lock time or
        // the PC number as a fallback so every machine stays labelled).
        let icon: IconDefinition | null = null;
        let text = '';
        // A physical PC seats at most one person.
        const user = pc?.users[0];
        if (status === PcStatusType.MAINTENANCE) icon = faWrench;
        else if (status === PcStatusType.LOCKED) text = lockedDuration(pc?.lockedAt ?? null);
        else if (user?.symbol) icon = symbolIcon(user.symbol);
        if (!icon && !text) text = id;

        const showNumber = text === id;
        const name = user?.username ?? '';
        const labelY = node.labelAbove ? node.y - R - 6 : node.y + R + 20;

        return (
          <g key={id}>
            {pcStyle === 'icon' ? (
              <g stroke="rgba(0,0,0,0.4)" strokeWidth="1.5">
                {/* monitor screen + stand, coloured by status */}
                <rect
                  x={node.x - R}
                  y={node.y - R + 2}
                  width={R * 2}
                  height={R * 1.5}
                  rx="3"
                  fill={STATUS_FILL[status]}
                />
                <rect
                  x={node.x - 5}
                  y={node.y + R * 0.5 + 2}
                  width={10}
                  height={6}
                  fill={STATUS_FILL[status]}
                  stroke="none"
                />
                <rect
                  x={node.x - 10}
                  y={node.y + R * 0.5 + 8}
                  width={20}
                  height={3}
                  rx="1.5"
                  fill={STATUS_FILL[status]}
                  stroke="none"
                />
              </g>
            ) : (
              <circle
                cx={node.x}
                cy={node.y}
                r={R}
                fill={STATUS_FILL[status]}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1.5"
              />
            )}
            {icon ? (
              <SvgIcon
                icon={icon}
                cx={node.x}
                cy={pcStyle === 'icon' ? node.y - 1 : node.y}
                size={20}
                fill="#1a1a1a"
              />
            ) : (
              <text
                x={node.x}
                y={pcStyle === 'icon' ? node.y - 1 : node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={showNumber ? 18 : 20}
                fontWeight={showNumber ? 500 : 600}
                fill={showNumber ? 'rgba(0,0,0,0.6)' : '#1a1a1a'}
              >
                {text}
              </text>
            )}
            {showUsernames && name && (
              <text
                x={node.x}
                y={labelY}
                textAnchor="middle"
                fontSize={name.length > 9 ? 16 : 20}
                fill="white"
              >
                {name.length > 12 ? `${name.slice(0, 12)}…` : name}
              </text>
            )}
          </g>
        );
      })}

      {/* Virtual-desktop / remote users, listed in the open top-right area of
          the room (bounded by the x=524 partition and the central desk). */}
      {showVdesktops && (
        <>
          <text x={671} y={30} textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.55)">
            vdesktop
          </text>
          {vdesktopUsers.length === 0 ? (
            <text x={671} y={58} textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.35)">
              nobody
            </text>
          ) : (
            <>
              {shownUsers.map((user, i) => {
                const icon = symbolIcon(user.symbol);
                const y = 56 + i * 22;
                return (
                  <g key={user.username}>
                    {icon && <SvgIcon icon={icon} cx={628} cy={y - 5} size={15} fill="white" />}
                    <text x={643} y={y} fontSize="18" fill="white">
                      {user.username}
                    </text>
                  </g>
                );
              })}
              {hiddenUsers > 0 && (
                <text
                  x={671}
                  y={56 + shownUsers.length * 22}
                  textAnchor="middle"
                  fontSize="16"
                  fill="rgba(255,255,255,0.55)"
                >
                  +{hiddenUsers} more
                </text>
              )}
            </>
          )}
        </>
      )}
    </svg>
  );
}
