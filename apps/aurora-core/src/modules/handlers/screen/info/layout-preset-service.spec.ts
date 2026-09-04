import { describe, it, expect, vi, afterEach } from 'vitest';
import LayoutPresetService from './layout-preset-service';
import InfoLayoutPreset from './entities/info-layout-preset';
import { HttpStatusCode } from '../../../../helpers/custom-error';

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

describe('LayoutPresetService name uniqueness', () => {
  afterEach(() => vi.restoreAllMocks());

  const params = { name: 'Borrel night', placements: [], modals: [] };

  it('refuses to create a second configuration with a taken name', async () => {
    vi.spyOn(InfoLayoutPreset, 'findOne').mockResolvedValue(fakePreset());
    await expect(new LayoutPresetService().create(params)).rejects.toMatchObject({
      status: HttpStatusCode.Conflict,
      message: 'A configuration named "Borrel night" already exists.',
    });
  });

  it('lets a configuration keep its own name', async () => {
    const preset = fakePreset();
    const save = vi.fn().mockResolvedValue(preset);
    // The row being updated, then the clash lookup that excludes it.
    vi.spyOn(InfoLayoutPreset, 'findOne')
      .mockResolvedValueOnce({ ...preset, save } as unknown as InfoLayoutPreset)
      .mockResolvedValueOnce(null);
    await expect(new LayoutPresetService().update(1, params)).resolves.toBe(preset);
    expect(save).toHaveBeenCalled();
  });

  it('refuses to rename a configuration onto another one', async () => {
    const preset = fakePreset();
    vi.spyOn(InfoLayoutPreset, 'findOne')
      .mockResolvedValueOnce(preset)
      .mockResolvedValueOnce(fakePreset({ id: 2 }));
    await expect(new LayoutPresetService().update(1, params)).rejects.toMatchObject({
      status: HttpStatusCode.Conflict,
    });
  });
});
