import { FooterSize, PosterResponse, PosterType } from '@gewis/aurora-api-client';

export default function makePoster(overrides: Partial<PosterResponse> = {}): PosterResponse {
  return {
    id: 1,
    name: 'poster',
    type: PosterType.LOGO,
    enabled: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    footerSize: FooterSize.FULL,
    defaultTimeout: 15,
    borrelMode: false,
    protected: false,
    trello: false,
    files: [],
    ...overrides,
  };
}
