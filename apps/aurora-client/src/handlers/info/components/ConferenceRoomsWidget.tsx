import { ConferenceRoomsResponse } from '@gewis/aurora-api-client';
import { sBool, sList, sStr, WidgetSettings } from '../settings';
import ConferenceTimeline from './ConferenceTimeline';

interface Props {
  rooms: ConferenceRoomsResponse | null;
  settings?: WidgetSettings;
}

function summarizeAvailable(count: number): string {
  if (count === 0) return 'No rooms available';
  if (count === 1) return 'One room available';
  return `${count} rooms available`;
}

/**
 * Conference-room availability. Two modes: a simple summary list (name/number +
 * free/occupied dot) or a per-room availability timeline. A per-widget room
 * selection (empty = all) narrows which rooms are shown.
 */
export default function ConferenceRoomsWidget({ rooms, settings }: Props) {
  const mode = sStr(settings, 'mode', 'summary');
  const onlyAvailable = sBool(settings, 'onlyAvailable', false);
  const selected = sList(settings, 'rooms');

  if (!rooms) {
    return <div className="font-raleway text-2xl text-white/60">Rooms unavailable</div>;
  }

  const scopedRooms = selected.length
    ? rooms.rooms.filter((r) => selected.includes(String(r.id)))
    : rooms.rooms;
  const summary = selected.length
    ? summarizeAvailable(scopedRooms.filter((r) => r.available).length)
    : rooms.summary;

  if (mode === 'timeline') {
    // The summary is scoped alongside the rooms, or a widget showing one room
    // would head it with the count for the whole building.
    return <ConferenceTimeline rooms={{ ...rooms, rooms: scopedRooms, summary }} />;
  }

  const list = onlyAvailable ? scopedRooms.filter((r) => r.available) : scopedRooms;

  return (
    <div className="flex h-full min-h-0 flex-col font-raleway text-white text-shadow">
      <div className="mb-3 shrink-0 text-2xl font-semibold">{summary}</div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        {list.map((room) => (
          <div key={room.number} className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 shrink-0 rounded-full ${room.available ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span className="text-2xl font-semibold">{room.number}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
