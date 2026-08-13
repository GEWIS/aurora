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
   * directory. A falsy/`"0"` number is treated as "not ringing".
   */
  public async resolve(number: string | null | undefined): Promise<CallerRingEvent> {
    const callers = await this.getAll();
    return CallerService.matchCaller(number, callers);
  }

  /**
   * Pure resolution of a caller id against a set of callers (no DB access).
   */
  public static matchCaller(
    number: string | null | undefined,
    callers: Pick<Caller, 'name' | 'numbers' | 'photoUrl'>[],
  ): CallerRingEvent {
    const normalized = CallerService.normalize(number ?? '');
    if (!normalized || normalized === '0') {
      return { ringing: false, known: false, name: null, photoUrl: null };
    }
    const match = callers.find((c) =>
      (c.numbers ?? []).some((n) => CallerService.normalize(n) === normalized),
    );
    if (!match) {
      return { ringing: true, known: false, name: null, photoUrl: null };
    }
    return { ringing: true, known: true, name: match.name, photoUrl: match.photoUrl };
  }

  /**
   * Normalise a phone number / SIP address for comparison: lower-case, and for
   * phone numbers strip spaces, dashes and parentheses so "+31 6 1234" matches
   * "+3161234". SIP addresses are left otherwise intact.
   */
  public static normalize(value: string): string {
    return value.trim().toLowerCase().replace(/[\s()-]/g, '');
  }

  private static normalizeAll(values: string[]): string[] {
    return (values ?? []).map((v) => v.trim()).filter(Boolean);
  }
}
