import { describe, it, expect } from 'vitest';
import LayoutService from './layout-service';
import {
  ChildWidget,
  DISABLED_WIDGETS,
  GRID_COLUMNS,
  WidgetPlacement,
  getCatalogItem,
} from './widget-catalog';

// Test inputs may omit instanceId/settings the way an older client would.
const place = (p: Partial<WidgetPlacement> & { id: string }): WidgetPlacement =>
  ({ instanceId: p.instanceId ?? p.id, x: 0, y: 0, w: 2, h: 2, ...p }) as WidgetPlacement;

const child = (c: Partial<ChildWidget> & { id: string }): ChildWidget =>
  ({ instanceId: c.instanceId ?? c.id, ...c }) as ChildWidget;

describe('LayoutService.sanitizePlacements', () => {
  it('clamps width/height to the catalog min/max span', () => {
    const [p] = LayoutService.sanitizePlacements([place({ id: 'clock', w: 8, h: 5 })]);
    expect(p.w).toBe(3);
    expect(p.h).toBe(2);
  });

  it('clamps x so the widget stays within the grid', () => {
    const [p] = LayoutService.sanitizePlacements([place({ id: 'workstations', x: 8, w: 5, h: 3 })]);
    expect(p.x).toBe(GRID_COLUMNS - p.w);
    expect(p.x + p.w).toBeLessThanOrEqual(GRID_COLUMNS);
  });

  it('drops unknown and modal widget ids', () => {
    expect(LayoutService.sanitizePlacements([place({ id: 'nope' })])).toHaveLength(0);
    expect(LayoutService.sanitizePlacements([place({ id: 'caller' })])).toHaveLength(0);
  });

  it('drops disabled widget ids', () => {
    for (const id of Object.keys(DISABLED_WIDGETS)) {
      expect(LayoutService.sanitizePlacements([place({ id })]), id).toHaveLength(0);
    }
  });

  it('allows multiple instances of the same widget with unique instanceIds', () => {
    const res = LayoutService.sanitizePlacements([
      place({ id: 'clock', instanceId: 'a' }),
      place({ id: 'clock', instanceId: 'b' }),
      place({ id: 'clock', instanceId: 'a' }), // duplicate id → gets a fresh one
    ]);
    expect(res).toHaveLength(3);
    const ids = res.map((p) => p.instanceId);
    expect(new Set(ids).size).toBe(3);
  });

  it('preserves the locked flag', () => {
    const [p] = LayoutService.sanitizePlacements([place({ id: 'clock', locked: true })]);
    expect(p.locked).toBe(true);
  });
});

describe('LayoutService container children', () => {
  const carousel = getCatalogItem('carousel')!;
  const statusStack = getCatalogItem('status-stack')!;

  it('drops container/modal/disabled/unknown children and keeps valid ones', () => {
    const res = LayoutService.sanitizeChildren(carousel, [
      child({ id: 'clock' }),
      child({ id: 'carousel' }), // container → no nesting
      child({ id: 'caller' }), // modal
      child({ id: 'caller-inline' }), // disabled
      child({ id: 'nope' }), // unknown
    ]);
    expect(res.map((c) => c.id)).toEqual(['clock']);
  });

  it('assigns unique child instanceIds', () => {
    const res = LayoutService.sanitizeChildren(carousel, [
      child({ id: 'clock', instanceId: 'x' }),
      child({ id: 'spotify', instanceId: 'x' }),
    ]);
    expect(new Set(res.map((c) => c.instanceId)).size).toBe(2);
  });

  it('empties child container settings when the container has no childSettings', () => {
    const [c] = LayoutService.sanitizeChildren(statusStack, [
      child({ id: 'spotify', containerSettings: { foo: 'bar' } }),
    ]);
    expect(c.containerSettings).toEqual({});
  });

  it('sanitizes children only for containers (non-containers drop children)', () => {
    const [carouselP] = LayoutService.sanitizePlacements([
      place({ id: 'carousel', children: [child({ id: 'clock' })] }),
    ]);
    expect(carouselP.children?.map((c) => c.id)).toEqual(['clock']);

    const [clockP] = LayoutService.sanitizePlacements([
      place({ id: 'clock', children: [child({ id: 'spotify' })] }),
    ]);
    expect(clockP.children).toBeUndefined();
  });
});

describe('LayoutService.sanitizeSettings', () => {
  const schema = getCatalogItem('clock')!.settings;

  it('keeps valid select/boolean values and drops unknown keys', () => {
    const out = LayoutService.sanitizeSettings(schema, {
      mode: 'analog',
      showSeconds: false,
      bogus: 'x',
    } as never);
    expect(out).toEqual({ mode: 'analog', showSeconds: false });
  });

  it('rejects out-of-schema select options', () => {
    const out = LayoutService.sanitizeSettings(schema, { mode: 'sundial' } as never);
    expect(out.mode).toBeUndefined();
  });

  it('clamps numbers to the setting bounds', () => {
    const caller = getCatalogItem('caller')!.settings;
    const out = LayoutService.sanitizeSettings(caller, { autoDismissSeconds: 999 });
    expect(out.autoDismissSeconds).toBe(120);
  });

  it('keeps text settings as strings', () => {
    const events = getCatalogItem('events')!.settings;
    const out = LayoutService.sanitizeSettings(events, { calendarUrl: 'https://x/cal.ics' });
    expect(out.calendarUrl).toBe('https://x/cal.ics');
  });

  it('keeps a de-duplicated id list for selectable entity settings', () => {
    const news = getCatalogItem('news')!.settings;
    const out = LayoutService.sanitizeSettings(news, {
      sources: ['1', '1', '2', 3 as unknown as string],
    });
    expect(out.sources).toEqual(['1', '2']);
  });

  it('drops manage-only entity settings (they carry no stored value)', () => {
    const caller = getCatalogItem('caller-inline')!.settings;
    const out = LayoutService.sanitizeSettings(caller, { directory: 'x' } as never);
    expect(out.directory).toBeUndefined();
  });
});

describe('LayoutService.sanitizeModals', () => {
  it('keeps only real modal ids and de-duplicates', () => {
    expect(LayoutService.sanitizeModals(['beer-modal', 'beer-modal', 'clock', 'nope'])).toEqual([
      'beer-modal',
    ]);
  });

  it('drops disabled modal ids', () => {
    // 'caller' is a real modal, but disabled — see DISABLED_WIDGETS.
    expect(LayoutService.sanitizeModals(['caller', 'beer-modal'])).toEqual(['beer-modal']);
  });
});

describe('LayoutService.sanitizeBackground', () => {
  it('accepts known backgrounds and falls back otherwise', () => {
    expect(LayoutService.sanitizeBackground('gradient')).toBe('gradient');
    expect(LayoutService.sanitizeBackground('rainbow')).toBe('hexagons');
    expect(LayoutService.sanitizeBackground(undefined)).toBe('hexagons');
  });
});

describe('LayoutService.sanitizePanelBackground', () => {
  it('accepts a valid composite and clamps opacity', () => {
    expect(LayoutService.sanitizePanelBackground('#1e3a8a|70|1|0')).toBe('#1e3a8a|70|1|0');
    expect(LayoutService.sanitizePanelBackground('#1e3a8a|999|1|0')).toBe('#1e3a8a|100|1|0');
  });

  it('falls back to the default for malformed values', () => {
    expect(LayoutService.sanitizePanelBackground('not-a-bg')).toBe('#374151|50|1|1');
    expect(LayoutService.sanitizePanelBackground('#1e3a8a|70')).toBe('#374151|50|1|1');
    expect(LayoutService.sanitizePanelBackground(undefined)).toBe('#374151|50|1|1');
  });
});
