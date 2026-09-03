import PcStatus, { PcSessionUser, PcStatusType, VDESKTOP_PC_ID } from './entities/pc-status';
import Keyholder from './entities/keyholder';

export interface PcStatusParams {
  pcId: string;
  /**
   * GEWIS membership number of the person logged in, or null for an account
   * that belongs to no member (a guest or service login). This is the identity:
   * the keyholder registry is matched on it, so the login name never reaches
   * aurora at all.
   */
  memberId?: number | null;
  /** Name to show for that session. Ignored when nobody is logged in. */
  name?: string | null;
  remote?: boolean;
  lockedAt?: string | null;
  status?: PcStatusType;
}

export interface SetPcUsageParams {
  pcs: PcStatusParams[];
}

/** One logged-in user, annotated from the keyholder registry. */
export interface PcUser {
  /** Membership number, or null for an account that belongs to no member. */
  memberId: number | null;
  name: string;
  /**
   * Board/keyholder symbol derived from the keyholder registry, or '' when the
   * member is not in it (or the account belongs to no member).
   */
  symbol: string;
}

export interface PcStatusResponse {
  pcId: string;
  /**
   * Who is logged in. A physical PC has at most one entry; the virtual desktop
   * ({@link VDESKTOP_PC_ID}) can have many at once. Empty when free or offline.
   */
  users: PcUser[];
  remote: boolean;
  lockedAt: string | null;
  status: PcStatusType;
}

const DEFAULT_STALE_MINUTES = 5;

/** Number of physical PCs in the room (ids "1".."10"); anything else is virtual. */
const PHYSICAL_PC_COUNT = 10;

/**
 * Owns the PC-usage state. A single poster instance keeps this up to date by
 * pushing the status of every PC at once through {@link replaceAll}. Reads
 * annotate each PC with a keyholder symbol and fall back to OFFLINE when a PC
 * has not been reported within the staleness window.
 */
export default class PcUsageService {
  private staleMinutes(): number {
    const parsed = parseInt(process.env.INFOSCREEN_PC_STALE_MINUTES || '', 10);
    return Number.isNaN(parsed) ? DEFAULT_STALE_MINUTES : parsed;
  }

  /**
   * Derive the symbol for a session by matching its membership number against
   * the keyholder registry. An account that belongs to no member, or a member
   * the registry does not list, gets no symbol.
   */
  public static deriveSymbol(memberId: number | null, keyholders: Keyholder[]): string {
    if (memberId === null) return '';
    const match = keyholders.find((k) => k.memberId === memberId);
    if (!match) return '';
    if (match.isBoard) return '★';
    if (match.isCandidateBoard && match.isKeyholder) return '🍭';
    if (match.isCandidateBoard) return '🍬';
    if (match.isKeyholder) return '🔑';
    return '';
  }

  private isStale(pc: PcStatus): boolean {
    const ageMs = Date.now() - new Date(pc.updatedAt).getTime();
    return ageMs > this.staleMinutes() * 60 * 1000;
  }

  /**
   * Bulk upsert the full set of PCs reported by the poster instance. PCs absent
   * from the payload are left untouched and will fall back to OFFLINE once they
   * go stale.
   *
   * The poster reports one entry per session, so every remote/virtual session
   * arrives under its own id. Those are folded into the single
   * {@link VDESKTOP_PC_ID} row (see {@link foldVirtual}), which is what makes
   * the virtual desktop one PC with many users rather than one PC per session.
   */
  public async replaceAll(params: SetPcUsageParams): Promise<void> {
    const physical = params.pcs.filter((input) => PcUsageService.isPhysical(input.pcId));
    const virtual = params.pcs.filter((input) => !PcUsageService.isPhysical(input.pcId));

    const writes = physical.map((input) =>
      PcUsageService.upsert(input.pcId, {
        users: PcUsageService.toSessionUser(input),
        remote: input.remote ?? false,
        lockedAt: input.lockedAt ? new Date(input.lockedAt) : null,
        status: input.status ?? PcUsageService.inferStatus(input),
      }),
    );

    // Only touch the vdesktop row when the report actually covers it, so a
    // partial post about a single physical PC does not empty it.
    if (virtual.length > 0) {
      writes.push(PcUsageService.upsert(VDESKTOP_PC_ID, PcUsageService.foldVirtual(virtual)));
    }

    await Promise.all(writes);
  }

  /**
   * Collapse the reported virtual sessions into the state of the one shared
   * virtual desktop: the de-duplicated set of logged-in users, remote by
   * definition, in use whenever anyone is on it. Pure, so the folding is unit
   * tested without a database.
   *
   * `lockedAt` is dropped — it describes a single session, and there is no
   * meaningful "the vdesktop is locked" once several people share it.
   */
  public static foldVirtual(inputs: PcStatusParams[]): {
    users: PcSessionUser[];
    remote: boolean;
    lockedAt: null;
    status: PcStatusType;
  } {
    const users: PcSessionUser[] = [];
    const seen = new Set<string>();
    for (const input of inputs) {
      const [user] = PcUsageService.toSessionUser(input);
      if (!user) continue;
      // Members de-duplicate on their membership number, so two sessions of the
      // same person collapse; nameless accounts fall back to the shown name.
      const key = user.memberId !== null ? `m${user.memberId}` : `n${user.name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      users.push(user);
    }
    return {
      users,
      remote: true,
      lockedAt: null,
      status: users.length > 0 ? PcStatusType.REMOTE : PcStatusType.FREE,
    };
  }

  /**
   * The session a report describes, as a zero- or one-element list. An entry
   * with neither a membership number nor a name is nobody: the seat is free.
   */
  public static toSessionUser(input: PcStatusParams): PcSessionUser[] {
    const name = (input.name ?? '').trim();
    const memberId = input.memberId ?? null;
    // '-' is the "nobody is logged in" sentinel reporters may send.
    if (memberId === null && (name === '' || name === '-')) return [];
    return [{ memberId, name: name || `Member ${memberId}` }];
  }

  /** Create or update one PC row, keeping it fresh for the staleness rule. */
  private static async upsert(
    pcId: string,
    values: {
      users: PcSessionUser[];
      remote: boolean;
      lockedAt: Date | null;
      status: PcStatusType;
    },
  ): Promise<void> {
    const pc = (await PcStatus.findOne({ where: { pcId } })) ?? PcStatus.create({ pcId });
    pc.users = values.users;
    pc.remote = values.remote;
    pc.lockedAt = values.lockedAt;
    pc.status = values.status;
    // Always refresh updatedAt so a PC re-reported with unchanged values is
    // still considered fresh; otherwise TypeORM skips the UPDATE (no column
    // diff), updatedAt goes stale, and the staleness rule wrongly marks it
    // OFFLINE.
    pc.updatedAt = new Date();
    await pc.save();
  }

  /**
   * Infer a status when the poster does not send one explicitly.
   */
  private static inferStatus(input: PcStatusParams): PcStatusType {
    if (input.lockedAt) return PcStatusType.LOCKED;
    if (input.remote) return PcStatusType.REMOTE;
    if (PcUsageService.toSessionUser(input).length === 0) return PcStatusType.FREE;
    return PcStatusType.IN_USE;
  }

  /** Physical PCs have ids "1".."10"; anything else is a virtual session. */
  public static isPhysical(pcId: string): boolean {
    const n = Number(pcId);
    return /^\d+$/.test(pcId.trim()) && n >= 1 && n <= PHYSICAL_PC_COUNT;
  }

  /**
   * PCs that exist whether or not anyone is on them: the physical machines and
   * the shared virtual desktop. Everything else is a per-session row (either a
   * legacy one, or one the poster invented) and is cleaned up once stale.
   */
  private static isPersistent(pcId: string): boolean {
    return PcUsageService.isPhysical(pcId) || pcId === VDESKTOP_PC_ID;
  }

  /**
   * Every PC, with a status that is current: a PC nothing has reported within
   * the staleness window reads as OFFLINE regardless of what it last said.
   */
  public async getAll(): Promise<PcStatusResponse[]> {
    const [pcs, keyholders] = await Promise.all([PcStatus.find(), Keyholder.find()]);

    // Stale per-session rows are deleted rather than lingering as offline rows;
    // the physical PCs and the shared virtual desktop persist (shown as offline
    // on the map).
    const removable = pcs.filter((pc) => this.isStale(pc) && !PcUsageService.isPersistent(pc.pcId));
    if (removable.length > 0) {
      await PcStatus.remove(removable);
    }
    const removedIds = new Set(removable.map((pc) => pc.pcId));

    return pcs
      .filter((pc) => !removedIds.has(pc.pcId))
      .map((pc) => {
        const status = this.isStale(pc) ? PcStatusType.OFFLINE : pc.status;
        // A PC with no active session shows nobody.
        const active =
          status === PcStatusType.OFFLINE || status === PcStatusType.MAINTENANCE
            ? []
            : (pc.users ?? []);
        return {
          pcId: pc.pcId,
          users: active.map((user) => ({
            memberId: user.memberId,
            name: user.name,
            symbol: PcUsageService.deriveSymbol(user.memberId, keyholders),
          })),
          remote: pc.remote,
          lockedAt: pc.lockedAt ? pc.lockedAt.toISOString() : null,
          status,
        };
      })
      .sort((a, b) => PcUsageService.comparePcId(a.pcId, b.pcId));
  }

  /**
   * Order physical PCs numerically (1, 2, … 10) and place any non-numeric ids
   * (e.g. virtual desktops) after them, sorted alphabetically.
   */
  private static comparePcId(a: string, b: string): number {
    const na = Number(a);
    const nb = Number(b);
    const aNum = a.trim() !== '' && !Number.isNaN(na);
    const bNum = b.trim() !== '' && !Number.isNaN(nb);
    if (aNum && bNum) return na - nb;
    if (aNum) return -1;
    if (bNum) return 1;
    return a.localeCompare(b);
  }
}
