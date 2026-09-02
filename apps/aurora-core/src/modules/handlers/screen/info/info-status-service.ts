import Keyholder from './entities/keyholder';
import RoomStatus from './entities/room-status';
import LdapKeyholderSyncService from './ldap-keyholder-sync-service';

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
  name: string;
  isBoard?: boolean;
  isCandidateBoard?: boolean;
  isKeyholder?: boolean;
  photoUrl?: string | null;
  usernames?: string[];
}

export interface KeyholderResponse {
  id: number;
  name: string;
  isBoard: boolean;
  isCandidateBoard: boolean;
  isKeyholder: boolean;
  photoUrl: string | null;
  usernames: string[];
  /**
   * True when this row comes from the LDAP sync. Such a row cannot be deleted
   * (the sync would recreate it) and only its name and photo may be edited.
   */
  ldapManaged: boolean;
  /** The name the directory last reported, for the "revert" action. */
  ldapName: string | null;
  /** True when the name shown differs from the directory's. */
  nameOverridden: boolean;
}

export interface RoomStatusParams {
  open: boolean;
  responsible1?: string | null;
  responsible2?: string | null;
  beerTime?: string | null;
  lastCall?: string | null;
  closedMessage?: string | null;
  coffeeStatus?: number;
}

export interface ResponsibleResponse {
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
 * Manages the backoffice-owned info screen data: the keyholder registry and the
 * current room status (responsible person(s) + beer time).
 */
export default class InfoStatusService {
  public static toKeyholderResponse(keyholder: Keyholder): KeyholderResponse {
    return {
      id: keyholder.id,
      name: keyholder.name,
      isBoard: keyholder.isBoard,
      isCandidateBoard: keyholder.isCandidateBoard,
      isKeyholder: keyholder.isKeyholder,
      photoUrl: keyholder.photoUrl,
      usernames: keyholder.usernames ?? [],
      ldapManaged: keyholder.ldapGuid !== null,
      ldapName: keyholder.ldapName,
      nameOverridden: LdapKeyholderSyncService.nameIsOverridden(keyholder),
    };
  }

  public async getKeyholders(): Promise<Keyholder[]> {
    return Keyholder.find({ order: { name: 'ASC' } });
  }

  public async createKeyholder(params: KeyholderParams): Promise<Keyholder> {
    const keyholder = Keyholder.create({
      name: params.name,
      isBoard: params.isBoard ?? false,
      isCandidateBoard: params.isCandidateBoard ?? false,
      isKeyholder: params.isKeyholder ?? false,
      photoUrl: params.photoUrl ?? null,
      usernames: params.usernames ?? [],
    });
    return keyholder.save();
  }

  /**
   * Update a keyholder. On an LDAP-managed row only the name and the photo are
   * applied — the login names and the flags follow group membership, and
   * accepting them here would produce an edit that silently disappears at the
   * next sync. Enforced server-side so it holds regardless of the client.
   */
  public async updateKeyholder(id: number, params: KeyholderParams): Promise<Keyholder | null> {
    const keyholder = await Keyholder.findOne({ where: { id } });
    if (!keyholder) return null;

    keyholder.name = params.name;
    keyholder.photoUrl = params.photoUrl ?? null;
    if (keyholder.ldapGuid === null) {
      keyholder.isBoard = params.isBoard ?? false;
      keyholder.isCandidateBoard = params.isCandidateBoard ?? false;
      keyholder.isKeyholder = params.isKeyholder ?? false;
      keyholder.usernames = params.usernames ?? [];
    }
    return keyholder.save();
  }

  /**
   * Restore an LDAP-managed keyholder's name to what the directory reports.
   * The photo is left alone: it is not part of the directory's state, so there
   * is nothing to restore it to and clearing it would just lose it.
   *
   * Returns null when there is no such row, and undefined when the row is not
   * LDAP-managed (nothing to revert to).
   */
  public async revertKeyholder(id: number): Promise<Keyholder | null | undefined> {
    const keyholder = await Keyholder.findOne({ where: { id } });
    if (!keyholder) return null;
    if (keyholder.ldapGuid === null || keyholder.ldapName === null) return undefined;

    keyholder.name = keyholder.ldapName;
    return keyholder.save();
  }

  /**
   * Delete a keyholder. LDAP-managed rows are refused: the next sync would
   * recreate them, so the delete would only appear to work.
   */
  public async deleteKeyholder(id: number): Promise<'deleted' | 'not-found' | 'ldap-managed'> {
    const keyholder = await Keyholder.findOne({ where: { id } });
    if (!keyholder) return 'not-found';
    if (keyholder.ldapGuid !== null) return 'ldap-managed';
    await keyholder.remove();
    return 'deleted';
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
      responsible1: null,
      responsible2: null,
      beerTime: null,
      closedMessage: null,
    }).save();
  }

  public async setRoomStatus(params: RoomStatusParams): Promise<RoomStatus> {
    const status = await this.getRoomStatusEntity();
    status.open = params.open;
    status.responsible1 = params.responsible1 ?? null;
    status.responsible2 = params.responsible2 ?? null;
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
   * Build the room-status response, annotating each responsible person with
   * board/keyholder flags by matching their name against the keyholder registry.
   * State last set on an earlier logical day is reported as reset (see isStale).
   */
  public async getRoomStatus(): Promise<RoomStatusResponse> {
    const status = await this.getRoomStatusEntity();
    const stale = InfoStatusService.isStale(status.updatedAt, new Date());
    const keyholders = await this.getKeyholders();

    const annotate = (name: string | null): ResponsibleResponse | null => {
      if (!name) return null;
      const match = keyholders.find((k) => k.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        isBoard: match?.isBoard ?? false,
        isCandidateBoard: match?.isCandidateBoard ?? false,
        isKeyholder: match?.isKeyholder ?? false,
        photoUrl: match?.photoUrl ?? null,
      };
    };

    const responsible = stale
      ? []
      : [annotate(status.responsible1), annotate(status.responsible2)].filter(
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
