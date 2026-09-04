import Keyholder from './entities/keyholder';
import { displayNames } from './display-name';
import RoomStatus from './entities/room-status';

/**
 * Hour of day (local) at which the room state resets for the new day (06:00):
 * the room is closed and the responsibles/beer time are cleared. The "logical
 * day" therefore runs from 06:00 to 06:00, so late-night activity past midnight
 * still counts as the same day.
 */
const DAILY_RESET_HOUR = 6;

/**
 * The most recent daily reset boundary (today at DAILY_RESET_HOUR, or yesterday's
 * if it is currently before that hour).
 */
function lastResetBoundary(now: Date): Date {
  const boundary = new Date(now);
  boundary.setHours(DAILY_RESET_HOUR, 0, 0, 0);
  if (now.getTime() < boundary.getTime()) boundary.setDate(boundary.getDate() - 1);
  return boundary;
}

export interface KeyholderParams {
  /**
   * What the screen calls this person. Blank means the short name is derived
   * from the full name (given name, plus surname where two people clash).
   */
  displayName?: string | null;
  /**
   * Profile photo shown on the info screen. Not part of the GEWIS records, so
   * it is set here or nowhere.
   */
  photoUrl?: string | null;
  /**
   * Whether this person is on the candidate board. The GEWIS API has no notion
   * of a candidate board, so this is the one flag a human decides.
   */
  isCandidateBoard?: boolean;
}

export interface KeyholderResponse {
  id: number;
  /** Full name, as the association records it. */
  name: string;
  /** What the screen shows: the override when set, else the derived short name. */
  displayName: string;
  /** The override itself, empty when the display name is derived. */
  displayNameOverride: string | null;
  isBoard: boolean;
  isCandidateBoard: boolean;
  isKeyholder: boolean;
  photoUrl: string | null;
  /** GEWIS membership number this row is synced from. */
  memberId: number | null;
}

export interface RoomStatusParams {
  open: boolean;
  /** Membership number of the first responsible person, or null for nobody. */
  responsible1MemberId?: number | null;
  responsible2MemberId?: number | null;
  beerTime?: string | null;
  lastCall?: string | null;
  closedMessage?: string | null;
  coffeeStatus?: number;
}

export interface ResponsibleResponse {
  /** Membership number, so the backoffice can round-trip the selection. */
  memberId: number | null;
  name: string;
  isBoard: boolean;
  isCandidateBoard: boolean;
  isKeyholder: boolean;
  photoUrl: string | null;
}

export interface RoomStatusResponse {
  open: boolean;
  responsible: ResponsibleResponse[];
  beerTime: string | null;
  lastCall: string | null;
  closedMessage: string | null;
  coffeeStatus: number;
}

/**
 * Manages the info screen's people and room state: the keyholder registry (kept
 * in step with the GEWIS records by the sync, and only annotated here with a
 * photo and the candidate-board flag) and the current room status (responsible
 * person(s) + beer time).
 */
export default class InfoStatusService {
  /**
   * @param shown effective display names for the whole registry (see
   * {@link displayNames}); a name is only derivable in the context of everyone
   * else, so it cannot be computed from one row.
   */
  public static toKeyholderResponse(
    keyholder: Keyholder,
    shown: Map<number, string>,
  ): KeyholderResponse {
    return {
      id: keyholder.id,
      name: keyholder.name,
      displayName: shown.get(keyholder.id) ?? keyholder.name,
      displayNameOverride: keyholder.displayName,
      isBoard: keyholder.isBoard,
      isCandidateBoard: keyholder.isCandidateBoard,
      isKeyholder: keyholder.isKeyholder,
      photoUrl: keyholder.photoUrl,
      memberId: keyholder.memberId,
    };
  }

  public async getKeyholders(): Promise<Keyholder[]> {
    return Keyholder.find({ order: { name: 'ASC' } });
  }

  /**
   * The whole registry as responses. Display names are derived across the set,
   * so this is the only way to build a correct response: one row does not know
   * whether its given name is ambiguous.
   */
  public async getKeyholderResponses(): Promise<KeyholderResponse[]> {
    const keyholders = await this.getKeyholders();
    const shown = displayNames(keyholders);
    return keyholders.map((k) => InfoStatusService.toKeyholderResponse(k, shown));
  }

  /**
   * Update the two fields the GEWIS records do not cover. Everything else —
   * who is a keyholder, who is on the board, what they are called, and whether
   * the row exists at all — follows the sync, so there is nothing else to
   * accept here.
   */
  public async updateKeyholder(id: number, params: KeyholderParams): Promise<Keyholder | null> {
    const keyholder = await Keyholder.findOne({ where: { id } });
    if (!keyholder) return null;

    keyholder.photoUrl = params.photoUrl ?? null;
    keyholder.isCandidateBoard = params.isCandidateBoard ?? false;
    // Blank means "derive it" rather than "call this person nothing".
    keyholder.displayName = (params.displayName ?? '').trim() || null;
    return keyholder.save();
  }

  /**
   * The room status is a singleton row. Always returns a row, creating a
   * default (closed) one on first access.
   */
  public async getRoomStatusEntity(): Promise<RoomStatus> {
    const existing = await RoomStatus.find({ order: { id: 'ASC' }, take: 1 });
    if (existing.length > 0) return existing[0];
    return RoomStatus.create({
      open: false,
      responsible1MemberId: null,
      responsible2MemberId: null,
      beerTime: null,
      closedMessage: null,
    }).save();
  }

  public async setRoomStatus(params: RoomStatusParams): Promise<RoomStatus> {
    const status = await this.getRoomStatusEntity();
    status.open = params.open;
    status.responsible1MemberId = params.responsible1MemberId ?? null;
    status.responsible2MemberId = params.responsible2MemberId ?? null;
    status.beerTime = params.beerTime ?? null;
    status.lastCall = params.lastCall ?? null;
    status.closedMessage = params.closedMessage ?? null;
    if (params.coffeeStatus !== undefined) status.coffeeStatus = params.coffeeStatus;
    // Always refresh updatedAt: it is what marks the state as belonging to the
    // current day (see isStale). Without this, re-submitting the form unchanged
    // produces no column diff, TypeORM skips the UPDATE, and the room would go
    // on reading as closed after the reset boundary.
    status.updatedAt = new Date();
    return status.save();
  }

  /**
   * Whether the stored state predates the current reset boundary, i.e. it was
   * last set on an earlier logical day. Rather than persisting a daily reset
   * (which only happens if something remembers to run it), the reset is derived
   * on read: stale state is reported as a closed room with no responsibles and
   * no beer time. `lastCall`, `closedMessage` and `coffeeStatus` are not part of
   * the daily state and are always reported as stored.
   */
  public static isStale(updatedAt: Date, now: Date): boolean {
    const setAt = new Date(updatedAt).getTime();
    // A row that has never been persisted has no updatedAt yet; its state is the
    // (closed) default, so there is nothing to reset.
    if (Number.isNaN(setAt)) return false;
    return setAt < lastResetBoundary(now).getTime();
  }

  /**
   * Build the room-status response, resolving each responsible person against
   * the keyholder registry by membership number for their name and flags.
   * State last set on an earlier logical day is reported as reset (see isStale).
   */
  public async getRoomStatus(): Promise<RoomStatusResponse> {
    const status = await this.getRoomStatusEntity();
    const stale = InfoStatusService.isStale(status.updatedAt, new Date());
    const keyholders = await this.getKeyholders();

    // Resolved from the registry, so the name shown always matches what the
    // GEWIS records currently say. A number with no row left behind it means the
    // person is no longer a keyholder at all, and showing a stale name would be
    // worse than showing nobody.
    const annotate = (memberId: number | null): ResponsibleResponse | null => {
      if (memberId === null) return null;
      const match = keyholders.find((k) => k.memberId === memberId);
      if (!match) return null;
      return {
        memberId,
        name: match.name,
        isBoard: match.isBoard,
        isCandidateBoard: match.isCandidateBoard,
        isKeyholder: match.isKeyholder,
        photoUrl: match.photoUrl,
      };
    };

    const responsible = stale
      ? []
      : [annotate(status.responsible1MemberId), annotate(status.responsible2MemberId)].filter(
          (r): r is ResponsibleResponse => r !== null,
        );

    return {
      open: stale ? false : status.open,
      responsible,
      beerTime: stale ? null : status.beerTime,
      lastCall: status.lastCall ?? null,
      closedMessage: status.closedMessage,
      coffeeStatus: status.coffeeStatus ?? 0,
    };
  }
}
