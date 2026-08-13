import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LAYOUT,
  DEFAULT_MODALS,
  DISABLED_WIDGETS,
  GRID_COLUMNS,
  WIDGET_CATALOG,
  WIDGET_CATEGORIES,
  enabledCatalog,
  getCatalogItem,
  isWidgetEnabled,
  placeableChildCatalog,
  resolveSettings,
} from './widget-catalog';

describe('WIDGET_CATALOG', () => {
  it('has unique ids', () => {
    const ids = WIDGET_CATALOG.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has min ≤ default ≤ max spans for placeable widgets', () => {
    for (const w of WIDGET_CATALOG.filter((c) => !c.modal)) {
      expect(w.minW).toBeLessThanOrEqual(w.defaultW);
      expect(w.defaultW).toBeLessThanOrEqual(w.maxW);
      expect(w.minH).toBeLessThanOrEqual(w.defaultH);
      expect(w.defaultH).toBeLessThanOrEqual(w.maxH);
      expect(w.maxW).toBeLessThanOrEqual(GRID_COLUMNS);
    }
  });
});

describe('widget categories', () => {
  it('gives every widget a category the palette knows how to group', () => {
    const known = new Set(WIDGET_CATEGORIES.map((c) => c.value));
    for (const w of WIDGET_CATALOG) {
      expect(known.has(w.category), `${w.id} has category "${w.category}"`).toBe(true);
    }
  });

  it('puts exactly the container widgets in the container category', () => {
    for (const w of WIDGET_CATALOG) {
      expect(w.category === 'container', w.id).toBe(!!w.container);
    }
  });

  it('lists each category once', () => {
    const values = WIDGET_CATEGORIES.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('DISABLED_WIDGETS', () => {
  it('only names widgets that actually exist, with a reason', () => {
    for (const [id, reason] of Object.entries(DISABLED_WIDGETS)) {
      expect(getCatalogItem(id), `unknown widget ${id}`).toBeDefined();
      expect(reason.length, `${id} has no reason`).toBeGreaterThan(0);
    }
  });

  it('hides disabled widgets from the catalog handed to the editor', () => {
    const ids = enabledCatalog().map((w) => w.id);
    for (const id of Object.keys(DISABLED_WIDGETS)) {
      expect(ids, id).not.toContain(id);
      expect(isWidgetEnabled(id), id).toBe(false);
    }
    expect(ids.length).toBe(WIDGET_CATALOG.length - Object.keys(DISABLED_WIDGETS).length);
  });

  it('still resolves disabled widgets by id (so stored layouts can be inspected)', () => {
    for (const id of Object.keys(DISABLED_WIDGETS)) {
      expect(getCatalogItem(id)?.id).toBe(id);
    }
  });
});

describe('DEFAULT_LAYOUT', () => {
  it('references only known, placeable, enabled widgets', () => {
    for (const p of DEFAULT_LAYOUT) {
      const item = getCatalogItem(p.id);
      expect(item, `unknown widget ${p.id}`).toBeDefined();
      expect(item?.modal).toBe(false);
      expect(isWidgetEnabled(p.id), `${p.id} is disabled`).toBe(true);
    }
  });

  it('fits within the grid width', () => {
    for (const p of DEFAULT_LAYOUT) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + p.w).toBeLessThanOrEqual(GRID_COLUMNS);
    }
  });

  it('does not place two widgets in the same cell', () => {
    const seen = new Set<string>();
    for (const p of DEFAULT_LAYOUT) {
      for (let x = p.x; x < p.x + p.w; x += 1) {
        for (let y = p.y; y < p.y + p.h; y += 1) {
          const key = `${x},${y}`;
          expect(seen.has(key), `overlap at ${key}`).toBe(false);
          seen.add(key);
        }
      }
    }
  });
});

describe('DEFAULT_MODALS', () => {
  it('only lists real, enabled modal widgets', () => {
    for (const id of DEFAULT_MODALS) {
      expect(getCatalogItem(id)?.modal).toBe(true);
      expect(isWidgetEnabled(id), `${id} is disabled`).toBe(true);
    }
  });
});

describe('widget settings schema', () => {
  it('has unique keys per widget and valid select defaults', () => {
    for (const w of WIDGET_CATALOG) {
      const keys = w.settings.map((s) => s.key);
      expect(new Set(keys).size, `${w.id} has duplicate keys`).toBe(keys.length);
      for (const s of w.settings) {
        if (s.type === 'select') {
          expect((s.options ?? []).some((o) => o.value === s.default)).toBe(true);
        }
        if (s.type === 'number') {
          expect(typeof s.default).toBe('number');
        }
      }
    }
  });
});

describe('container widgets', () => {
  it('carousel and status-stack are containers with a childSettings schema', () => {
    for (const id of ['carousel', 'status-stack']) {
      const item = getCatalogItem(id)!;
      expect(item.container).toBe(true);
      expect(Array.isArray(item.childSettings)).toBe(true);
    }
  });

  it('placeableChildCatalog excludes containers, modals and disabled widgets', () => {
    const ids = placeableChildCatalog().map((w) => w.id);
    expect(ids).toContain('clock');
    expect(ids).not.toContain('carousel');
    expect(ids).not.toContain('status-stack');
    expect(ids).not.toContain('caller');
    for (const id of Object.keys(DISABLED_WIDGETS)) expect(ids, id).not.toContain(id);
  });
});

describe('resolveSettings', () => {
  it('applies catalog defaults and overrides for known keys', () => {
    const resolved = resolveSettings('clock', { mode: 'analog', bogus: 1 });
    expect(resolved.mode).toBe('analog');
    expect(resolved.showSeconds).toBe(true); // default
    expect('bogus' in resolved).toBe(false); // unknown keys dropped
  });
});

describe('panel background injection', () => {
  it('placeable non-container widgets expose panelBackground; modals/containers do not', () => {
    for (const w of WIDGET_CATALOG) {
      const hasPanelBg = w.settings.some((s) => s.key === 'panelBackground');
      expect(hasPanelBg, `${w.id}`).toBe(!w.modal && !w.container);
    }
  });
});

describe('entity + validate settings', () => {
  const entities = new Set(['callers', 'conference-rooms', 'news-sources']);
  const kinds = new Set(['ical', 'rss', 'station', 'image', 'url', 'status-api']);

  it('entity settings reference a known entity with a sensible default', () => {
    for (const w of WIDGET_CATALOG) {
      for (const s of w.settings.filter((x) => x.type === 'entity')) {
        expect(entities.has(s.entity ?? ''), `${w.id}.${s.key}`).toBe(true);
        expect(Array.isArray(s.default)).toBe(!!s.selectable);
      }
    }
  });

  it('validate settings use a known check kind on a text field', () => {
    for (const w of WIDGET_CATALOG) {
      for (const s of w.settings.filter((x) => x.validate)) {
        expect(kinds.has(s.validate ?? ''), `${w.id}.${s.key}`).toBe(true);
        expect(s.type).toBe('text');
      }
    }
  });
});
