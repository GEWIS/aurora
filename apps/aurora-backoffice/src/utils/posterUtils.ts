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
