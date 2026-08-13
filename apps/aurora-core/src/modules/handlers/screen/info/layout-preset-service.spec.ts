import { describe, it, expect } from 'vitest';
import LayoutPresetService from './layout-preset-service';
import InfoLayoutPreset from './entities/info-layout-preset';

/** Build a preset-like object without touching the DB. */
function fakePreset(overrides: Partial<InfoLayoutPreset> = {}): InfoLayoutPreset {
  return {
    id: 1,
    name: 'Borrel night',
    placements: [],
    modals: [],
    background: 'gradient',
    backgroundImage: '',
    backgroundColor: '#0b1020',
    defaultPanelBackground: '#1e3a8a|70|1|0',
    ...overrides,
  } as InfoLayoutPreset;
}

describe('LayoutPresetService.toResponse', () => {
  it('maps and sanitizes a stored preset', () => {
    const res = LayoutPresetService.toResponse(fakePreset());
    expect(res).toMatchObject({
      id: 1,
      name: 'Borrel night',
      background: 'gradient',
      backgroundColor: '#0b1020',
      defaultPanelBackground: '#1e3a8a|70|1|0',
    });
    expect(res.placements).toEqual([]);
    expect(res.modals).toEqual([]);
  });

  it('falls back on malformed backgrounds and drops unknown widgets', () => {
    const res = LayoutPresetService.toResponse(
      fakePreset({
        background: 'rainbow',
        backgroundColor: 'nope',
        defaultPanelBackground: 'bad',
        placements: [{ instanceId: 'x', id: 'not-a-widget', x: 0, y: 0, w: 2, h: 1 }] as never,
        modals: null as never,
      }),
    );
    expect(res.background).toBe('hexagons');
    expect(res.backgroundColor).toBe('#0b1020');
    expect(res.defaultPanelBackground).toBe('#374151|50|1|1');
    expect(res.placements).toEqual([]);
    expect(res.modals).toEqual([]);
  });
});
