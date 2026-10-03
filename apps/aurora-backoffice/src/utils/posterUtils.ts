import type { PosterResponse } from '@gewis/aurora-api-client';

export type PosterStatus = 'live' | 'borrel' | 'expired' | 'scheduled' | 'disabled';

export const posterStatusLabels: Record<PosterStatus, string> = {
  live: 'Active',
  borrel: 'Borrel only',
  expired: 'Expired',
  scheduled: 'Not yet active',
  disabled: 'Disabled',
};

export function getPosterStatus(poster: PosterResponse): PosterStatus {
  if (!poster.enabled) return 'disabled';
  if (poster.expirationDate && new Date(poster.expirationDate).getTime() < Date.now()) {
    return 'expired';
  }
  if (poster.startDate && new Date(poster.startDate).getTime() > Date.now()) {
    return 'scheduled';
  }
  if (poster.borrelMode) return 'borrel';
  return 'live';
}

/**
 * Format a date for poster overviews, e.g. "5 Oct 2026, 10:00".
 * @param date
 */
export function formatPosterDate(date: string | Date): string {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Describe the period in which a poster is shown, based on its optional start and end.
 * @param startDate
 * @param expirationDate
 */
export function formatPosterPeriod(startDate?: string, expirationDate?: string): string {
  if (startDate && expirationDate) {
    return `${formatPosterDate(startDate)} to ${formatPosterDate(expirationDate)}`;
  }
  if (startDate) return `From ${formatPosterDate(startDate)}`;
  if (expirationDate) return `Until ${formatPosterDate(expirationDate)}`;
  return 'No dates, always shown';
}
