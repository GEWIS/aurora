import axios from 'axios';
import CalendarService from './calendar-service';
import ConferenceRoomEntity from './entities/conference-room';

export interface RoomBusyInterval {
  start: string;
  end: string;
}

export interface ConferenceRoom {
  /** Config row id (used by the per-widget room selection). */
  id: number;
  /** Room identifier / number, e.g. "MF 3.141". */
  number: string;
  available: boolean;
  /** Today's busy intervals (for the timeline view). */
  busy: RoomBusyInterval[];
}

export interface ConferenceRoomsResponse {
  /** One-line human summary, e.g. "Two rooms available". */
  summary: string;
  rooms: ConferenceRoom[];
}

export interface ConferenceRoomParams {
  number: string;
  icalUrl?: string | null;
}

export interface ConferenceRoomConfigResponse {
  id: number;
  number: string;
  icalUrl: string | null;
}

/**
 * Reports conference-room availability. Rooms are managed in the backoffice; a
 * room's availability + today's bookings are derived from its iCal calendar feed.
 * When no rooms are configured, hardcoded demo data is returned (so the widget —
 * including its timeline view — still shows something).
 */
export default class ConferenceRoomsService {
  // --- backoffice CRUD ------------------------------------------------------

  public static toConfigResponse(room: ConferenceRoomEntity): ConferenceRoomConfigResponse {
    return { id: room.id, number: room.number, icalUrl: room.icalUrl };
  }

  public async getConfigs(): Promise<ConferenceRoomEntity[]> {
    return ConferenceRoomEntity.find({ order: { number: 'ASC' } });
  }

  public async create(params: ConferenceRoomParams): Promise<ConferenceRoomEntity> {
    return ConferenceRoomEntity.create({
      number: params.number,
      icalUrl: params.icalUrl ?? null,
    }).save();
  }

  public async update(id: number, params: ConferenceRoomParams): Promise<ConferenceRoomEntity | null> {
    const room = await ConferenceRoomEntity.findOne({ where: { id } });
    if (!room) return null;
    room.number = params.number;
    room.icalUrl = params.icalUrl ?? null;
    return room.save();
  }

  public async delete(id: number): Promise<boolean> {
    const room = await ConferenceRoomEntity.findOne({ where: { id } });
    if (!room) return false;
    await room.remove();
    return true;
  }

  // --- availability ---------------------------------------------------------

  public async getRooms(now: Date = new Date()): Promise<ConferenceRoomsResponse> {
    const configs = await ConferenceRoomEntity.find({ order: { number: 'ASC' } });
    if (configs.length === 0) return ConferenceRoomsService.stub(now);

    const rooms = await Promise.all(
      configs.map((c) => ConferenceRoomsService.roomStatus(c, now)),
    );
    return { summary: ConferenceRoomsService.summarize(rooms), rooms };
  }

  private static async roomStatus(
    config: ConferenceRoomEntity,
    now: Date,
  ): Promise<ConferenceRoom> {
    let busy: RoomBusyInterval[] = [];
    if (config.icalUrl) {
      try {
        const { data } = await axios.get<string>(config.icalUrl, { responseType: 'text' });
        busy = ConferenceRoomsService.busyToday(data, now);
      } catch {
        busy = [];
      }
    }
    return {
      id: config.id,
      number: config.number,
      available: ConferenceRoomsService.isAvailable(busy, now),
      busy,
    };
  }

  /** Parse an iCal feed into today's busy intervals, sorted by start. */
  public static busyToday(ical: string, now: Date): RoomBusyInterval[] {
    return CalendarService.parse(ical)
      .filter((e) => ConferenceRoomsService.sameDay(new Date(e.start), now))
      .map((e) => ({ start: e.start, end: e.end ?? e.start }))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  /** A room is available when no busy interval covers `now`. */
  public static isAvailable(busy: RoomBusyInterval[], now: Date): boolean {
    const t = now.getTime();
    return !busy.some((b) => new Date(b.start).getTime() <= t && t < new Date(b.end).getTime());
  }

  private static sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  public static summarize(rooms: ConferenceRoom[]): string {
    const available = rooms.filter((r) => r.available).length;
    if (available === 0) return 'No rooms available';
    if (available === 1) return 'One room available';
    return `${available} rooms available`;
  }

  /** Demo data used when no rooms are configured. */
  private static stub(now: Date): ConferenceRoomsResponse {
    const iso = (min: number) => new Date(now.getTime() + min * 60_000).toISOString();
    const rooms: ConferenceRoom[] = [
      { id: -1, number: 'MF 3.141', available: true, busy: [{ start: iso(60), end: iso(120) }] },
      { id: -2, number: 'MF 3.142', available: true, busy: [] },
      { id: -3, number: 'MF 3.144', available: true, busy: [{ start: iso(-30), end: iso(45) }] },
    ].map((r) => ({ ...r, available: ConferenceRoomsService.isAvailable(r.busy, now) }));
    return { summary: ConferenceRoomsService.summarize(rooms), rooms };
  }
}
