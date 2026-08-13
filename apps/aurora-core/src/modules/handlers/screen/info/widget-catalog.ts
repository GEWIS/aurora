/**
 * The catalog of widgets the info screen supports. This is the single source of
 * truth shared (via the `widget-catalog` endpoint) with the backoffice layout
 * editor (palette + resize bounds + per-widget settings) and the client
 * (id → component mapping + setting consumption).
 *
 * Grid model: a fixed 9-column grid (16px gutters/margins) with 8 rows. A
 * placeable widget occupies a rectangle `{ x, y, w, h }` in grid cells. The same
 * widget type may be placed multiple times; each placement has its own unique
 * `instanceId` and its own `settings`. Modal widgets are not placed on the grid;
 * they are toggled on or off and render as an overlay when triggered (beer
 * countdown, incoming call).
 */

export type WidgetSettingValue = string | number | boolean | string[];

export interface WidgetSettingOption {
  label: string;
  value: string;
}

/** A backoffice-managed global entity that an `entity` setting references. */
export type EntityKind = 'callers' | 'conference-rooms' | 'news-sources';

/** External-value check kinds a setting's "test" button can run. */
export type ValidateKind = 'ical' | 'rss' | 'station' | 'image' | 'url' | 'status-api';

/** A single configurable setting exposed by a widget. */
export interface WidgetSetting {
  key: string;
  label: string;
  /**
   * `background` is a composite panel background: a `"#rrggbb|opacity|border|blur"`
   * string edited with a colour/opacity/border picker + preset swatches.
   * `entity` renders a manager for a global list (callers/rooms/news sources); when
   * `selectable` it is a per-widget multiselect filter storing the chosen ids.
   */
  type: 'boolean' | 'select' | 'number' | 'text' | 'background' | 'entity';
  default: WidgetSettingValue;
  /** For `select`: the allowed options. */
  options?: WidgetSettingOption[];
  /** For `number`: inclusive bounds. */
  min?: number;
  max?: number;
  /** For `number`: number of decimal places allowed (default 0). */
  step?: number;
  /** For `entity`: which global list this setting manages/selects. */
  entity?: 'callers' | 'conference-rooms' | 'news-sources';
  /** For `entity`: when true the setting is a per-widget id filter (empty = all). */
  selectable?: boolean;
  /** For `text`: enables a "test" button that validates the value via this check. */
  validate?: ValidateKind;
  /**
   * Only show this setting in the editor when another setting has a given value,
   * e.g. `{ key: 'mode', value: 'digital' }`.
   */
  visibleWhen?: { key: string; value: string };
}

export interface WidgetCatalogItem {
  /** Stable identifier, also used to map to the client component. */
  id: string;
  /** Human-readable name shown in the backoffice palette. */
  name: string;
  /** PrimeIcons class for the backoffice palette. */
  icon: string;
  defaultW: number;
  defaultH: number;
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
  /** Modal widgets overlay the screen when active and are not grid-placed. */
  modal: boolean;
  /** The configurable settings this widget exposes. */
  settings: WidgetSetting[];
  /** Container widgets hold and manage child widget instances (no nesting). */
  container?: boolean;
  /** For containers: the per-child config schema (e.g. status trigger/emit). */
  childSettings?: WidgetSetting[];
}

/** A child widget instance held by a container widget. */
export interface ChildWidget {
  /** Unique per child within its container. */
  instanceId: string;
  /** The child widget type (a non-container, non-modal catalog id). */
  id: string;
  /** The child widget's own settings. */
  settings?: Record<string, WidgetSettingValue>;
  /** Per-child config assigned by the container (per its `childSettings`). */
  containerSettings?: Record<string, WidgetSettingValue>;
}

/** Placement of a single grid widget, in grid cells. */
export interface WidgetPlacement {
  /** Unique per placement, so the same widget type can appear multiple times. */
  instanceId: string;
  /** The widget type (a catalog id). */
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** When true the widget cannot be moved or resized in the editor. */
  locked?: boolean;
  /** Per-instance setting overrides (missing keys fall back to catalog defaults). */
  settings?: Record<string, WidgetSettingValue>;
  /** For container widgets: the child widget instances it manages. */
  children?: ChildWidget[];
}

/**
 * Widgets that exist in code but are switched off, mapped to the reason why.
 *
 * A disabled widget is hidden from the backoffice palette (the `widget-catalog`
 * endpoint omits it) and stripped from any layout, preset or container that
 * still references it, so it can never reach a screen. Its component and service
 * are left untouched: re-enabling is a matter of deleting the entry here.
 */
export const DISABLED_WIDGETS: Record<string, string> = {
  'conference-rooms': 'Room availability has no real booking source yet.',
  'caller-inline': 'The phone integration that reports incoming calls is not implemented yet.',
  caller: 'The phone integration that reports incoming calls is not implemented yet.',
};

/** Number of columns in the info-screen grid. */
export const GRID_COLUMNS = 9;

/** Rows in the default layout; the client sizes the grid to fit 1080px. */
export const GRID_ROWS = 8;

/**
 * Screen-wide background options. `color` uses the layout's `backgroundColor`;
 * `image` uses the layout's `backgroundImage`.
 */
export const BACKGROUND_OPTIONS: WidgetSettingOption[] = [
  { label: 'Hexagons', value: 'hexagons' },
  { label: 'Gradient', value: 'gradient' },
  { label: 'Grid', value: 'grid' },
  { label: 'Solid colour', value: 'color' },
  { label: 'Custom image', value: 'image' },
];
export const DEFAULT_BACKGROUND = 'hexagons';
export const DEFAULT_BACKGROUND_COLOR = '#0b1020';

type VisibleWhen = WidgetSetting['visibleWhen'];

// Small builders to keep the settings definitions compact.
const bool = (key: string, label: string, def = true, visibleWhen?: VisibleWhen): WidgetSetting => ({
  key,
  label,
  type: 'boolean',
  default: def,
  visibleWhen,
});
const select = (
  key: string,
  label: string,
  options: WidgetSettingOption[],
  def: string,
  visibleWhen?: VisibleWhen,
): WidgetSetting => ({ key, label, type: 'select', default: def, options, visibleWhen });
const num = (
  key: string,
  label: string,
  def: number,
  min: number,
  max: number,
  step = 0,
  visibleWhen?: VisibleWhen,
): WidgetSetting => ({ key, label, type: 'number', default: def, min, max, step, visibleWhen });
const text = (
  key: string,
  label: string,
  def = '',
  validate?: ValidateKind,
  visibleWhen?: VisibleWhen,
): WidgetSetting => ({ key, label, type: 'text', default: def, validate, visibleWhen });
const entity = (
  key: string,
  label: string,
  entityKind: EntityKind,
  selectable = false,
): WidgetSetting => ({
  key,
  label,
  type: 'entity',
  default: selectable ? [] : '',
  entity: entityKind,
  selectable,
});

/** The full set of IANA timezones (searchable in the editor), with a fallback. */
export const TIMEZONE_OPTIONS: WidgetSettingOption[] = (() => {
  try {
    // Node 18+ / modern browsers.
    const zones = (Intl as unknown as { supportedValuesOf(k: string): string[] }).supportedValuesOf(
      'timeZone',
    );
    return zones.map((z) => ({ label: z.replace(/_/g, ' '), value: z }));
  } catch {
    return [
      { label: 'Europe/Amsterdam', value: 'Europe/Amsterdam' },
      { label: 'UTC', value: 'UTC' },
    ];
  }
})();

/** Per-widget setting definitions, keyed by catalog id. */
const WIDGET_SETTINGS: Record<string, WidgetSetting[]> = {
  clock: [
    text('title', 'Widget title', 'Eindhoven Time'),
    select('mode', 'Style', [
      { label: 'Digital', value: 'digital' },
      { label: 'Analog', value: 'analog' },
    ], 'digital'),
    select('timezone', 'Timezone', TIMEZONE_OPTIONS, 'Europe/Amsterdam'),
    bool('showSeconds', 'Show seconds', true),
    bool('showDate', 'Show date', true),
    bool('use24h', '24-hour clock', true, { key: 'mode', value: 'digital' }),
  ],
  weather: [
    select('mode', 'Mode', [
      { label: 'Rain timeline', value: 'timeline' },
      { label: 'Status (icon + temperature)', value: 'summary' },
    ], 'timeline'),
    num('latitude', 'Latitude', 51.447, -90, 90, 4),
    num('longitude', 'Longitude', 5.487, -180, 180, 4),
    bool('showEmoji', 'Show weather icon', true, { key: 'mode', value: 'summary' }),
    bool('showDetails', 'Show wind/humidity/pressure', true, { key: 'mode', value: 'summary' }),
  ],
  'room-responsible': [
    bool('showPhotos', 'Show photos', true),
    bool('showSymbols', 'Show board/key symbols', true),
  ],
  beer: [
    bool('altColor', 'Highlight in orange after beer time', true),
    bool('showIcon', 'Show glass icon', true),
    bool('showLastCall', 'Show last-call time (set in room status)', true),
  ],
  spotify: [bool('showCover', 'Show album cover', true)],
  events: [
    text('calendarUrl', 'iCal calendar URL', '', 'ical'),
    bool('showTime', 'Show start time', true),
    bool('showEndTime', 'Show end time', false),
  ],
  trains: [
    text('station', 'NS station code (e.g. EHV, ASD, UT)', 'EHV', 'station'),
    bool('showDelays', 'Show delays', true),
  ],
  news: [
    entity('sources', 'Sources shown', 'news-sources', true),
    select('speed', 'Scroll speed', [
      { label: 'Slow', value: 'slow' },
      { label: 'Normal', value: 'normal' },
      { label: 'Fast', value: 'fast' },
    ], 'normal'),
    bool('sourceSatire', 'Show GEWIS satirical headlines', true),
    num('maxItems', 'Max headlines shown', 20, 1, 100),
    bool('interleave', 'Interleave sources', true),
  ],
  workstations: [
    select('pcStyle', 'PC style', [
      { label: 'Circles', value: 'circle' },
      { label: 'Icons', value: 'icon' },
    ], 'circle'),
    bool('showUsernames', 'Show usernames', true),
    bool('showVdesktops', 'Show virtual desktops', true),
  ],
  services: [
    text(
      'statusPageUrl',
      'Uptime Kuma or Gatus URL (blank = uptime.gewis.nl)',
      '',
      'status-api',
    ),
    bool('onlyOffline', 'Only unfold offline groups', false),
    bool('showSummary', 'Show summary line', true),
  ],
  'conference-rooms': [
    entity('rooms', 'Rooms shown', 'conference-rooms', true),
    select('mode', 'Mode', [
      { label: 'Summary list', value: 'summary' },
      { label: 'Timeline', value: 'timeline' },
    ], 'summary'),
    bool('onlyAvailable', 'Only show available rooms', false, { key: 'mode', value: 'summary' }),
  ],
  logo: [
    bool('flip', 'Flip every 3 minutes', true),
  ],
  // The coffee widget has no display settings of its own (it always shows a
  // coffee icon plus a status icon and label). It keeps only the universal
  // panel-background setting injected below.
  coffee: [],
  'caller-inline': [
    text('idleText', 'Text when no call', 'No incoming calls'),
    entity('directory', 'Caller directory', 'callers'),
  ],
  text: [
    text('content', 'Text', 'Hello'),
    select('align', 'Alignment', [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ], 'center'),
    select('size', 'Size', [
      { label: 'Small', value: 'sm' },
      { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg' },
      { label: 'Extra large', value: 'xl' },
    ], 'lg'),
  ],
  image: [
    text('url', 'Image URL', '', 'image'),
    select('fit', 'Fit', [
      { label: 'Cover', value: 'cover' },
      { label: 'Contain', value: 'contain' },
    ], 'cover'),
  ],
  carousel: [
    num('interval', 'Seconds per widget', 8, 2, 120),
    select('animation', 'Transition', [
      { label: 'Fade', value: 'fade' },
      { label: 'Slide horizontal', value: 'slide-h' },
      { label: 'Slide vertical', value: 'slide-v' },
    ], 'fade'),
  ],
  // The status-stack is configured globally (not per child): a background child
  // is shown for `duration` with the `emit` effect. Which child triggers on
  // which event is derived from the child widget's type (client-side).
  'status-stack': [
    num('duration', 'Background show for (seconds)', 10, 2, 120),
    select('emit', 'Attention effect', [
      { label: 'None', value: 'none' },
      { label: 'Flash / pulse', value: 'flash' },
      { label: 'Shake', value: 'shake' },
      { label: 'Glow border', value: 'glow' },
      { label: 'Radiating border', value: 'radiate' },
    ], 'flash'),
  ],
  'beer-modal': [],
  caller: [
    num('autoDismissSeconds', 'Auto-dismiss after (seconds)', 20, 5, 120),
    entity('directory', 'Caller directory', 'callers'),
  ],
};

/** Per-child config schemas for container widgets, keyed by container id. */
const CHILD_SETTINGS: Record<string, WidgetSetting[]> = {
  carousel: [],
  'status-stack': [],
};

const RAW_CATALOG: Omit<WidgetCatalogItem, 'settings'>[] = [
  // Placeable panels
  { id: 'clock', name: 'Time & date', icon: 'pi-clock', defaultW: 2, defaultH: 2, minW: 2, minH: 2, maxW: 3, maxH: 2, modal: false }, // prettier-ignore
  { id: 'weather', name: 'Weather forecast', icon: 'pi-cloud', defaultW: 3, defaultH: 2, minW: 2, minH: 1, maxW: 4, maxH: 5, modal: false }, // prettier-ignore
  { id: 'room-responsible', name: 'Room responsibles', icon: 'pi-users', defaultW: 2, defaultH: 3, minW: 2, minH: 2, maxW: 3, maxH: 4, modal: false }, // prettier-ignore
  { id: 'beer', name: 'Beer time', icon: 'pi-star', defaultW: 2, defaultH: 1, minW: 2, minH: 1, maxW: 2, maxH: 2, modal: false }, // prettier-ignore
  { id: 'spotify', name: 'Now playing', icon: 'pi-play-circle', defaultW: 2, defaultH: 1, minW: 2, minH: 1, maxW: 4, maxH: 2, modal: false }, // prettier-ignore
  { id: 'events', name: 'Events today', icon: 'pi-calendar', defaultW: 3, defaultH: 3, minW: 2, minH: 1, maxW: 4, maxH: 5, modal: false }, // prettier-ignore
  { id: 'trains', name: 'Train departures', icon: 'pi-directions', defaultW: 2, defaultH: 3, minW: 2, minH: 1, maxW: 3, maxH: 5, modal: false }, // prettier-ignore
  { id: 'news', name: 'News ticker', icon: 'pi-megaphone', defaultW: 9, defaultH: 1, minW: 4, minH: 1, maxW: 9, maxH: 1, modal: false }, // prettier-ignore
  { id: 'workstations', name: 'Workstation info', icon: 'pi-desktop', defaultW: 5, defaultH: 4, minW: 3, minH: 2, maxW: 7, maxH: 6, modal: false }, // prettier-ignore
  { id: 'services', name: 'GEWIS services', icon: 'pi-server', defaultW: 2, defaultH: 2, minW: 2, minH: 2, maxW: 4, maxH: 3, modal: false }, // prettier-ignore
  { id: 'conference-rooms', name: 'Conference rooms', icon: 'pi-building', defaultW: 3, defaultH: 2, minW: 2, minH: 2, maxW: 4, maxH: 4, modal: false }, // prettier-ignore
  { id: 'logo', name: 'GEWIS logo', icon: 'pi-image', defaultW: 2, defaultH: 2, minW: 1, minH: 2, maxW: 2, maxH: 3, modal: false }, // prettier-ignore
  { id: 'coffee', name: 'Coffee status', icon: 'pi-inbox', defaultW: 2, defaultH: 1, minW: 2, minH: 1, maxW: 3, maxH: 2, modal: false }, // prettier-ignore
  { id: 'caller-inline', name: 'Caller', icon: 'pi-phone', defaultW: 2, defaultH: 2, minW: 2, minH: 1, maxW: 4, maxH: 3, modal: false }, // prettier-ignore
  { id: 'text', name: 'Text', icon: 'pi-align-center', defaultW: 2, defaultH: 1, minW: 1, minH: 1, maxW: 9, maxH: 4, modal: false }, // prettier-ignore
  { id: 'image', name: 'Image', icon: 'pi-image', defaultW: 2, defaultH: 2, minW: 1, minH: 1, maxW: 6, maxH: 6, modal: false }, // prettier-ignore
  // Container widgets (hold child widgets)
  { id: 'carousel', name: 'Carousel', icon: 'pi-images', defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 6, maxH: 6, modal: false, container: true }, // prettier-ignore
  { id: 'status-stack', name: 'Status stack', icon: 'pi-clone', defaultW: 3, defaultH: 3, minW: 2, minH: 2, maxW: 6, maxH: 6, modal: false, container: true }, // prettier-ignore
  // Modal / overlay widgets (toggled on/off, not grid-placed)
  { id: 'beer-modal', name: 'Beer countdown (overlay)', icon: 'pi-star', defaultW: 0, defaultH: 0, minW: 0, minH: 0, maxW: 0, maxH: 0, modal: true }, // prettier-ignore
  { id: 'caller', name: 'Incoming call (overlay)', icon: 'pi-phone', defaultW: 0, defaultH: 0, minW: 0, minH: 0, maxW: 0, maxH: 0, modal: true }, // prettier-ignore
];

/**
 * Panel background presets for a widget card, encoded as `"#rrggbb|opacity|
 * border|blur"` (opacity 0–100, border/blur 0/1). Shown as swatches in the
 * editor; the colour/opacity/border are also freely editable.
 */
export const PANEL_BACKGROUND_OPTIONS: WidgetSettingOption[] = [
  { label: 'Glass', value: '#374151|50|1|1' },
  { label: 'Dark', value: '#0f172a|85|1|0' },
  { label: 'Red', value: '#8b1a1a|85|1|0' },
  { label: 'Blue', value: '#1e3a8a|70|1|0' },
  { label: 'Green', value: '#064e3b|70|1|0' },
  { label: 'Transparent', value: '#000000|20|1|0' },
  { label: 'Solid', value: '#111827|100|0|0' },
  { label: 'None', value: '#000000|0|0|0' },
];
export const DEFAULT_PANEL_BACKGROUND = '#374151|50|1|1';

const PANEL_BACKGROUND_SETTING: WidgetSetting = {
  key: 'panelBackground',
  label: 'Widget background',
  type: 'background',
  default: DEFAULT_PANEL_BACKGROUND,
  options: PANEL_BACKGROUND_OPTIONS,
};

export const WIDGET_CATALOG: WidgetCatalogItem[] = RAW_CATALOG.map((w) => ({
  ...w,
  // Placeable widgets can pick their own card background. Modal widgets have no
  // card, and container widgets are transparent (only their children carry a
  // background), so neither gets the panel-background setting.
  settings:
    w.modal || w.container
      ? (WIDGET_SETTINGS[w.id] ?? [])
      : [PANEL_BACKGROUND_SETTING, ...(WIDGET_SETTINGS[w.id] ?? [])],
  childSettings: w.container ? (CHILD_SETTINGS[w.id] ?? []) : undefined,
}));

/** Look up a catalog item by id. */
export function getCatalogItem(id: string): WidgetCatalogItem | undefined {
  return WIDGET_CATALOG.find((w) => w.id === id);
}

/** Whether a catalog id is a container widget (holds child widgets). */
export function isContainer(id: string): boolean {
  return !!getCatalogItem(id)?.container;
}

/** Whether an id refers to a known widget that is not disabled. */
export function isWidgetEnabled(id: string): boolean {
  return !!getCatalogItem(id) && !(id in DISABLED_WIDGETS);
}

/** The catalog without disabled widgets — what the backoffice editor is offered. */
export function enabledCatalog(): WidgetCatalogItem[] {
  return WIDGET_CATALOG.filter((w) => isWidgetEnabled(w.id));
}

/** Catalog widgets that may be placed as a child of a container (no nesting). */
export function placeableChildCatalog(): WidgetCatalogItem[] {
  return enabledCatalog().filter((w) => !w.modal && !w.container);
}

/**
 * Resolve the effective settings for a placement: the catalog defaults with the
 * placement's overrides applied on top (only for known keys).
 */
export function resolveSettings(
  id: string,
  overrides?: Record<string, WidgetSettingValue>,
): Record<string, WidgetSettingValue> {
  const item = getCatalogItem(id);
  const out: Record<string, WidgetSettingValue> = {};
  (item?.settings ?? []).forEach((s) => {
    const v = overrides?.[s.key];
    out[s.key] = v !== undefined ? v : s.default;
  });
  return out;
}

/** Ids of the modal widgets enabled by default on a fresh screen. */
export const DEFAULT_MODALS: string[] = ['beer-modal', 'caller'].filter(isWidgetEnabled);

/**
 * A sensible default grid layout, modelled on the sketch's example layout: the
 * workstation map anchors the top-left, room/clock/beer/spotify/coffee fill the
 * upper right, an info row (events/trains/weather/services) sits below, with a
 * full-width news ticker at the bottom.
 */
export const DEFAULT_LAYOUT: WidgetPlacement[] = (
  [
    { id: 'workstations', x: 0, y: 0, w: 5, h: 4 },
    { id: 'room-responsible', x: 5, y: 0, w: 2, h: 3 },
    { id: 'clock', x: 7, y: 0, w: 2, h: 2 },
    { id: 'beer', x: 7, y: 2, w: 2, h: 1 },
    { id: 'coffee', x: 7, y: 3, w: 2, h: 1 },
    { id: 'spotify', x: 5, y: 3, w: 2, h: 1 },
    { id: 'events', x: 0, y: 4, w: 3, h: 3 },
    { id: 'trains', x: 3, y: 4, w: 2, h: 3 },
    { id: 'services', x: 5, y: 4, w: 2, h: 3 },
    { id: 'weather', x: 7, y: 4, w: 2, h: 3 },
    { id: 'news', x: 0, y: 7, w: 9, h: 1 },
  ] as Omit<WidgetPlacement, 'instanceId'>[]
)
  .filter((p) => isWidgetEnabled(p.id))
  .map((p) => ({ instanceId: p.id, ...p }));
