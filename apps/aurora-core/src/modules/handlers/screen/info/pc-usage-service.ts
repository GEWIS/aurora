import PcStatus, { PcStatusType, PcOverride } from './entities/pc-status';
import Keyholder from './entities/keyholder';

export interface PcStatusParams {
  pcId: string;
  username?: string | null;
  remote?: boolean;
  lockedAt?: string | null;
  status?: PcStatusType;
}

export interface SetPcUsageParams {
  pcs: PcStatusParams[];
}

export interface SetPcOverrideParams {
  override: PcOverride;
}

export interface PcStatusResponse {
  pcId: string;
  username: string | null;
  remote: boolean;
  lockedAt: string | null;
  status: PcStatusType;
  /**
   * Board/keyholder symbol derived from the keyholder registry, or '' when the
   * user is unknown/not a keyholder.
   */
  symbol: string;
  /**
   * Backoffice override (none / maintenance / disabled).
   */
  override: PcOverride;
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
   * Derive the symbol for a username by matching it against the keyholder
   * registry (case-insensitive, on any of the keyholder's usernames).
   */
  public static deriveSymbol(username: string | null, keyholders: Keyholder[]): string {
    if (!username) return '';
    const match = keyholders.find((k) =>
      (k.usernames ?? []).some((u) => u.toLowerCase() === username.toLowerCase()),
    );
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
   */
  public async replaceAll(params: SetPcUsageParams): Promise<void> {
    await Promise.all(
      params.pcs.map(async (input) => {
        const pc =
          (await PcStatus.findOne({ where: { pcId: input.pcId } })) ??
          PcStatus.create({ pcId: input.pcId });
        pc.username = input.username ?? null;
        pc.remote = input.remote ?? false;
        pc.lockedAt = input.lockedAt ? new Date(input.lockedAt) : null;
        pc.status = input.status ?? PcUsageService.inferStatus(input);
        // Always refresh updatedAt so a PC re-reported with unchanged values is
        // still considered fresh; otherwise TypeORM skips the UPDATE (no column
        // diff), updatedAt goes stale, and the staleness rule wrongly marks it
        // OFFLINE.
        pc.updatedAt = new Date();
        await pc.save();
      }),
    );
  }

  /**
   * Infer a status when the poster does not send one explicitly.
   */
  private static inferStatus(input: PcStatusParams): PcStatusType {
    if (input.lockedAt) return PcStatusType.LOCKED;
    if (input.remote) return PcStatusType.REMOTE;
    if (!input.username || input.username === '-') return PcStatusType.FREE;
    return PcStatusType.IN_USE;
  }

  /** Physical PCs have ids "1".."10"; anything else is a virtual desktop. */
  private static isPhysical(pcId: string): boolean {
    const n = Number(pcId);
    return /^\d+$/.test(pcId.trim()) && n >= 1 && n <= PHYSICAL_PC_COUNT;
  }

  /**
   * @param includeDisabled include DISABLED PCs (for the backoffice management
   * view). The screen feed leaves this false so disabled PCs stay hidden.
   */
  public async getAll(includeDisabled = false): Promise<PcStatusResponse[]> {
    const [pcs, keyholders] = await Promise.all([PcStatus.find(), Keyholder.find()]);

    // Inactive virtual desktops are deleted rather than lingering as offline
    // rows; physical PCs persist (shown as offline on the map). PCs with a
    // backoffice override are kept so the admin's intent is not lost.
    const removable = pcs.filter(
      (pc) =>
        this.isStale(pc) &&
        pc.overrideState === PcOverride.NONE &&
        !PcUsageService.isPhysical(pc.pcId),
    );
    if (removable.length > 0) {
      await PcStatus.remove(removable);
    }
    const removedIds = new Set(removable.map((pc) => pc.pcId));

    return pcs
      .filter((pc) => !removedIds.has(pc.pcId))
      .filter((pc) => includeDisabled || pc.overrideState !== PcOverride.DISABLED)
      .map((pc) => {
        const stale = this.isStale(pc);
        // Backoffice overrides take precedence over the reported status.
        let status = stale ? PcStatusType.OFFLINE : pc.status;
        if (pc.overrideState === PcOverride.MAINTENANCE) status = PcStatusType.MAINTENANCE;
        // A PC with no active session shows neither a user nor a keyholder symbol.
        const username =
          status === PcStatusType.OFFLINE || status === PcStatusType.MAINTENANCE
            ? null
            : pc.username;
        return {
          pcId: pc.pcId,
          username,
          remote: pc.remote,
          lockedAt: pc.lockedAt ? pc.lockedAt.toISOString() : null,
          status,
          symbol: PcUsageService.deriveSymbol(username, keyholders),
          override: pc.overrideState,
        };
      })
      .sort((a, b) => PcUsageService.comparePcId(a.pcId, b.pcId));
  }

  /**
   * Set the backoffice override for a PC (maintenance / disabled / none).
   * Returns false when the PC does not exist.
   */
  public async setOverride(pcId: string, override: PcOverride): Promise<boolean> {
    const pc = await PcStatus.findOne({ where: { pcId } });
    if (!pc) return false;
    pc.overrideState = override;
    await pc.save();
    return true;
  }

  /**
   * Delete a PC. It reappears on the next status post from the poster.
   * Returns false when the PC does not exist.
   */
  public async deletePc(pcId: string): Promise<boolean> {
    const pc = await PcStatus.findOne({ where: { pcId } });
    if (!pc) return false;
    await pc.remove();
    return true;
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
