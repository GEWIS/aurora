/**
 * Formatting for "time remaining" displays.
 *
 * A clock shows *elapsed* time floored — at 15:59:55.4 it reads 15:59:55. A
 * countdown must therefore round its *remaining* time **up**: with 4.6 seconds
 * to go you are still inside the fifth-from-last second, so the countdown reads
 * 00:05 and reaches zero at the same instant the clock reaches the target.
 * Flooring the remainder instead (the obvious mirror of the clock) throws away
 * the partial second and runs a full second early.
 */

/** Whole units remaining, rounded up; `ms` may be negative (time since). */
function remaining(ms: number, unitMs: number): number {
  return Math.ceil(Math.abs(ms) / unitMs);
}

function pad(n: number): string {
  return Math.floor(n).toString().padStart(2, '0');
}

/** Seconds remaining, rounded up. */
export function remainingSeconds(ms: number): number {
  return remaining(ms, 1000);
}

/** Minutes remaining, rounded up. */
export function remainingMinutes(ms: number): number {
  return remaining(ms, 60_000);
}

/**
 * `mm:ss` remaining. The total is rounded up once and only then split, so the
 * parts always carry: 4.6s is `00:05`, never `00:04` or `01:05`.
 */
export function formatMmSs(ms: number): string {
  const total = remainingSeconds(ms);
  return `${pad(total / 60)}:${pad(total % 60)}`;
}

/** `hh:mm:ss` remaining, rounded up as a whole (see {@link formatMmSs}). */
export function formatHhMmSs(ms: number): string {
  const total = remainingSeconds(ms);
  return `${pad(total / 3600)}:${pad((total % 3600) / 60)}:${pad(total % 60)}`;
}

/** Hours and minutes remaining, rounded up as a whole. */
export function remainingHoursMinutes(ms: number): { hours: number; minutes: number } {
  const total = remainingMinutes(ms);
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

/** "1 hour" / "2 hours", "1 minute" / "45 minutes". */
function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}

/**
 * Hours and minutes remaining as a phrase to read out loud: "2 hours and 32
 * minutes", "45 minutes", "1 hour". A zero part is dropped rather than shown,
 * so it never reads "2 hours and 0 minutes"; under a minute it is "less than a
 * minute", since the parts would otherwise both be gone.
 */
export function remainingInWords(ms: number): string {
  const { hours, minutes } = remainingHoursMinutes(ms);
  if (hours === 0 && minutes === 0) return 'less than a minute';
  if (hours === 0) return plural(minutes, 'minute');
  if (minutes === 0) return plural(hours, 'hour');
  return `${plural(hours, 'hour')} and ${plural(minutes, 'minute')}`;
}
