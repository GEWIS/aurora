import { randomUUID } from 'crypto';
import InfoScreenLayout from './entities/info-screen-layout';
import {
  BACKGROUND_OPTIONS,
  ChildWidget,
  DEFAULT_BACKGROUND,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_LAYOUT,
  DEFAULT_MODALS,
  DEFAULT_PANEL_BACKGROUND,
  GRID_COLUMNS,
  WIDGET_CATALOG,
  WidgetCatalogItem,
  WidgetPlacement,
  WidgetSetting,
  WidgetSettingValue,
  getCatalogItem,
  isWidgetEnabled,
} from './widget-catalog';

export interface InfoScreenLayoutResponse {
  screenId: number;
  placements: WidgetPlacement[];
  modals: string[];
  /** Screen-wide background style (see BACKGROUND_OPTIONS). */
  background: string;
  /** Image URL used when `background` is 'image'. */
  backgroundImage: string;
  /** Solid colour (hex) used when `background` is 'color'. */
  backgroundColor: string;
  /** Default panel background (composite) for new widgets / "apply to all". */
  defaultPanelBackground: string;
}

export interface SetInfoLayoutParams {
  placements: WidgetPlacement[];
  modals: string[];
  background?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  defaultPanelBackground?: string;
}

/**
 * Owns the per-screen widget layout. Reads fall back to a default layout for
 * screens that have never been configured. Writes are clamped/validated against
 * the widget catalog so a bad payload can never produce an out-of-bounds grid.
 */
export default class LayoutService {
  /** The layout for a screen, or the shared default when none is saved. */
  public async getForScreen(screenId: number): Promise<InfoScreenLayoutResponse> {
    const row = await InfoScreenLayout.findOne({ where: { screenId } });
    if (!row) {
      return {
        screenId,
        placements: DEFAULT_LAYOUT,
        modals: DEFAULT_MODALS,
        background: DEFAULT_BACKGROUND,
        backgroundImage: '',
        backgroundColor: DEFAULT_BACKGROUND_COLOR,
        defaultPanelBackground: DEFAULT_PANEL_BACKGROUND,
      };
    }
    // Normalise stored placements so legacy rows gain instanceIds/settings.
    return {
      screenId,
      placements: LayoutService.sanitizePlacements(row.placements ?? []),
      modals: LayoutService.sanitizeModals(row.modals ?? []),
      background: LayoutService.sanitizeBackground(row.background),
      backgroundImage: row.backgroundImage ?? '',
      backgroundColor: LayoutService.sanitizeColor(row.backgroundColor),
      defaultPanelBackground: LayoutService.sanitizePanelBackground(row.defaultPanelBackground),
    };
  }

  /** Persist a (validated) layout for a screen, upserting the singleton row. */
  public async save(
    screenId: number,
    params: SetInfoLayoutParams,
  ): Promise<InfoScreenLayoutResponse> {
    const placements = LayoutService.sanitizePlacements(params.placements);
    const modals = LayoutService.sanitizeModals(params.modals);
    const background = LayoutService.sanitizeBackground(params.background);
    const backgroundImage = typeof params.backgroundImage === 'string' ? params.backgroundImage : '';
    const backgroundColor = LayoutService.sanitizeColor(params.backgroundColor);
    const defaultPanelBackground = LayoutService.sanitizePanelBackground(params.defaultPanelBackground);

    const row =
      (await InfoScreenLayout.findOne({ where: { screenId } })) ??
      InfoScreenLayout.create({ screenId });
    row.placements = placements;
    row.modals = modals;
    row.background = background;
    row.backgroundImage = backgroundImage;
    row.backgroundColor = backgroundColor;
    row.defaultPanelBackground = defaultPanelBackground;
    await row.save();

    return {
      screenId,
      placements,
      modals,
      background,
      backgroundImage,
      backgroundColor,
      defaultPanelBackground,
    };
  }

  /** Copy the current layout of a source screen to every other screen. */
  public async copyToAll(sourceScreenId: number, screenIds: number[]): Promise<void> {
    const source = await this.getForScreen(sourceScreenId);
    await Promise.all(
      screenIds
        .filter((id) => id !== sourceScreenId)
        .map((id) =>
          this.save(id, {
            placements: source.placements,
            modals: source.modals,
            background: source.background,
            backgroundImage: source.backgroundImage,
            backgroundColor: source.backgroundColor,
            defaultPanelBackground: source.defaultPanelBackground,
          }),
        ),
    );
  }

  /**
   * Drop unknown/modal/disabled ids, clamp every placement to its catalog min/max
   * span and the grid bounds, ensure unique instanceIds, and validate per-widget
   * settings.
   */
  public static sanitizePlacements(placements: WidgetPlacement[]): WidgetPlacement[] {
    if (!Array.isArray(placements)) return [];
    const result: WidgetPlacement[] = [];
    const seen = new Set<string>();
    for (const p of placements) {
      const item = getCatalogItem(p?.id);
      if (!item || item.modal || !isWidgetEnabled(item.id)) continue;
      const w = clamp(Math.round(p.w), item.minW, item.maxW);
      const h = clamp(Math.round(p.h), item.minH, item.maxH);
      const x = clamp(Math.round(p.x), 0, GRID_COLUMNS - w);
      const y = Math.max(0, Math.round(p.y));

      let instanceId = typeof p.instanceId === 'string' && p.instanceId ? p.instanceId : item.id;
      while (seen.has(instanceId)) instanceId = randomUUID();
      seen.add(instanceId);

      result.push({
        instanceId,
        id: item.id,
        x,
        y,
        w,
        h,
        locked: !!p.locked,
        settings: LayoutService.sanitizeSettings(item.settings, p.settings),
        children: item.container ? LayoutService.sanitizeChildren(item, p.children) : undefined,
      });
    }
    return result;
  }

  /**
   * Validate a container's child widgets: drop unknown/modal/disabled/container
   * child ids (no nesting), sanitize each child's own settings and its
   * container-assigned settings, and ensure unique child instanceIds.
   */
  public static sanitizeChildren(
    container: WidgetCatalogItem,
    children: ChildWidget[] | undefined,
  ): ChildWidget[] {
    if (!Array.isArray(children)) return [];
    const seen = new Set<string>();
    const out: ChildWidget[] = [];
    for (const c of children) {
      const childItem = getCatalogItem(c?.id);
      if (!childItem || childItem.modal || childItem.container) continue;
      if (!isWidgetEnabled(childItem.id)) continue;
      let instanceId = typeof c.instanceId === 'string' && c.instanceId ? c.instanceId : childItem.id;
      while (seen.has(instanceId)) instanceId = randomUUID();
      seen.add(instanceId);
      out.push({
        instanceId,
        id: childItem.id,
        settings: LayoutService.sanitizeSettings(childItem.settings, c.settings),
        containerSettings: LayoutService.sanitizeSettings(container.childSettings ?? [], c.containerSettings),
      });
    }
    return out;
  }

  /** Keep only known setting keys and coerce values to the schema type/options. */
  public static sanitizeSettings(
    schema: WidgetSetting[],
    settings: Record<string, WidgetSettingValue> | undefined,
  ): Record<string, WidgetSettingValue> {
    const out: Record<string, WidgetSettingValue> = {};
    if (!settings || typeof settings !== 'object') return out;
    for (const s of schema) {
      if (!(s.key in settings)) continue;
      const raw = settings[s.key];
      if (s.type === 'boolean') {
        out[s.key] = !!raw;
      } else if (s.type === 'number') {
        const n = Number(raw);
        if (!Number.isNaN(n)) out[s.key] = clamp(n, s.min ?? -Infinity, s.max ?? Infinity);
      } else if (s.type === 'select') {
        if ((s.options ?? []).some((o) => o.value === raw)) out[s.key] = raw;
      } else if (s.type === 'text') {
        out[s.key] = typeof raw === 'string' ? raw : String(raw ?? '');
      } else if (s.type === 'background') {
        // "#rrggbb|opacity|border|blur" — validate + clamp opacity.
        if (typeof raw === 'string' && /^#[0-9a-fA-F]{6}\|\d{1,3}\|[01]\|[01]$/.test(raw)) {
          const [hex, op, border, blur] = raw.split('|');
          const opacity = Math.min(100, Math.max(0, parseInt(op, 10)));
          out[s.key] = `${hex}|${opacity}|${border}|${blur}`;
        }
      } else if (s.type === 'entity') {
        // Selectable entity settings store a de-duplicated list of id strings
        // (empty = "show all"). Manage-only entity controls carry no value.
        if (s.selectable && Array.isArray(raw)) {
          out[s.key] = [...new Set(raw.filter((v): v is string => typeof v === 'string'))];
        }
      }
    }
    return out;
  }

  /** Keep only ids that refer to an actual, enabled modal widget. */
  public static sanitizeModals(modals: string[]): string[] {
    if (!Array.isArray(modals)) return [];
    const modalIds = new Set(
      WIDGET_CATALOG.filter((w) => w.modal && isWidgetEnabled(w.id)).map((w) => w.id),
    );
    return [...new Set(modals)].filter((id) => modalIds.has(id));
  }

  /** Fall back to the default background for unknown values. */
  public static sanitizeBackground(background: string | undefined | null): string {
    return BACKGROUND_OPTIONS.some((o) => o.value === background)
      ? (background as string)
      : DEFAULT_BACKGROUND;
  }

  /** Keep a valid `#rrggbb` colour, otherwise fall back to the default. */
  public static sanitizeColor(color: string | undefined | null): string {
    return typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color)
      ? color
      : DEFAULT_BACKGROUND_COLOR;
  }

  /**
   * Validate a composite panel background `"#rrggbb|opacity|border|blur"`
   * (clamping opacity), falling back to the default panel background.
   */
  public static sanitizePanelBackground(value: string | undefined | null): string {
    if (typeof value === 'string' && /^#[0-9a-fA-F]{6}\|\d{1,3}\|[01]\|[01]$/.test(value)) {
      const [hex, op, border, blur] = value.split('|');
      const opacity = Math.min(100, Math.max(0, parseInt(op, 10)));
      return `${hex}|${opacity}|${border}|${blur}`;
    }
    return DEFAULT_PANEL_BACKGROUND;
  }
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
