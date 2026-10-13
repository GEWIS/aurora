import Caller from './entities/caller';

export interface CallerParams {
  name: string;
  numbers: string[];
  photoUrl?: string | null;
}

export interface CallerResponse {
  id: number;
  name: string;
  numbers: string[];
  photoUrl: string | null;
}

export interface CallerRingParams {
  /** The reported phone number or SIP address of the incoming call. */
  number: string;
  /**
   * Reported caller name, used when the number is unknown
   * to the directory (or absent, as on a Teams-to-Teams call). A directory match
   * always wins, so a caller renamed in the backoffice stays renamed.
   */
  name?: string | null;
}

/**
 * The payload pushed to screens when the phone rings. `known` distinguishes a
 * matched directory entry (name + photo) from an unknown caller (generic
 * "phone is ringing" overlay).
 */
export interface CallerRingEvent {
  ringing: boolean;
  known: boolean;
  name: string | null;
  photoUrl: string | null;
}

/**
 * The event that dismisses the overlay: the call was answered, declined or
 * cancelled. Frozen because it is shared by every caller that reports a hang-up.
 */
export const CALL_ENDED: CallerRingEvent = Object.freeze({
  ringing: false,
  known: false,
  name: null,
  photoUrl: null,
});

/**
 * Manages the caller directory and resolves an incoming caller id against it.
 * Mirrors the legacy `lync_caller.php` number → name/photo mapping.
 */
export default class CallerService {
  public static toResponse(caller: Caller): CallerResponse {
    return {
      id: caller.id,
      name: caller.name,
      numbers: caller.numbers ?? [],
      photoUrl: caller.photoUrl,
    };
  }

  public async getAll(): Promise<Caller[]> {
    return Caller.find({ order: { name: 'ASC' } });
  }

  public async create(params: CallerParams): Promise<Caller> {
    const caller = Caller.create({
      name: params.name,
      numbers: CallerService.normalizeAll(params.numbers),
      photoUrl: params.photoUrl ?? null,
    });
    return caller.save();
  }

  public async update(id: number, params: CallerParams): Promise<Caller | null> {
    const caller = await Caller.findOne({ where: { id } });
    if (!caller) return null;
    caller.name = params.name;
    caller.numbers = CallerService.normalizeAll(params.numbers);
    caller.photoUrl = params.photoUrl ?? null;
    return caller.save();
  }

  public async delete(id: number): Promise<boolean> {
    const caller = await Caller.findOne({ where: { id } });
    if (!caller) return false;
    await caller.remove();
    return true;
  }

  /**
   * Resolve a reported caller id (phone number or SIP address) against the
   * directory. A falsy/`"0"` number is treated as "not ringing", unless the
   * phone system reported a name (a Teams-to-Teams call has no number).
   */
  public async resolve(
    number: string | null | undefined,
    reportedName?: string | null,
  ): Promise<CallerRingEvent> {
    const callers = await this.getAll();
    return CallerService.matchCaller(number, callers, reportedName);
  }

  /**
   * Pure resolution of a caller id against a set of callers (no DB access).
   * The directory (renaming a caller in backoffice) wins over the reported name.
   */
  public static matchCaller(
    number: string | null | undefined,
    callers: Pick<Caller, 'name' | 'numbers' | 'photoUrl'>[],
    reportedName?: string | null,
  ): CallerRingEvent {
    const normalized = CallerService.normalize(number ?? '');
    const name = (reportedName ?? '').trim() || null;
    if (!normalized || normalized === '0') {
      // No number at all: still ring if the phone system named the caller.
      return name ? { ringing: true, known: false, name, photoUrl: null } : CALL_ENDED;
    }
    const match = callers.find((c) =>
      (c.numbers ?? []).some((n) => CallerService.normalize(n) === normalized),
    );
    if (!match) {
      return { ringing: true, known: false, name, photoUrl: null };
    }
    return { ringing: true, known: true, name: match.name, photoUrl: match.photoUrl };
  }

  /**
   * Normalise a phone number / SIP address for comparison: lower-case, and for
   * phone numbers strip spaces, dashes and parentheses so "+31 6 1234" matches
   * "+3161234". SIP addresses are left otherwise intact.
   */
  public static normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\s()-]/g, '');
  }

  private static normalizeAll(values: string[]): string[] {
    return (values ?? []).map((v) => v.trim()).filter(Boolean);
  }
}
