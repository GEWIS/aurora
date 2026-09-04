/** Per-widget settings as delivered over the wire (a loose value record). */
export type WidgetSettings = Record<string, string | number | boolean | string[]>;

/** Read a boolean setting, falling back to a default. */
export function sBool(s: WidgetSettings | undefined, key: string, def: boolean): boolean {
  const v = s?.[key];
  return typeof v === 'boolean' ? v : def;
}

/** Read a string setting, falling back to a default. */
export function sStr(s: WidgetSettings | undefined, key: string, def: string): string {
  const v = s?.[key];
  return typeof v === 'string' ? v : def;
}

/** Read a numeric setting, falling back to a default. */
export function sNum(s: WidgetSettings | undefined, key: string, def: number): number {
  const v = s?.[key];
  return typeof v === 'number' ? v : def;
}

/** Read a string-list setting (per-widget entity selection); empty = "all". */
export function sList(s: WidgetSettings | undefined, key: string): string[] {
  const v = s?.[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}
