import { CSSProperties } from 'react';

/** Parsed panel background: `"#rrggbb|opacity|border|blur"`. */
export interface PanelBg {
  color: string;
  opacity: number; // 0–100
  border: boolean;
  blur: boolean;
}

export function parsePanelBg(value?: string): PanelBg {
  const m = /^#([0-9a-fA-F]{6})\|(\d{1,3})\|([01])\|([01])$/.exec(value ?? '');
  if (!m) return { color: '#374151', opacity: 50, border: true, blur: true };
  return {
    color: `#${m[1]}`,
    opacity: Math.min(100, Number(m[2])),
    border: m[3] === '1',
    blur: m[4] === '1',
  };
}

export function encodePanelBg(b: PanelBg): string {
  return `${b.color}|${Math.round(b.opacity)}|${b.border ? 1 : 0}|${b.blur ? 1 : 0}`;
}

/** CSS style for a panel background composite, or transparent when omitted. */
export function panelStyle(value?: string): CSSProperties {
  if (!value) return {}; // container widgets: transparent, no border
  const b = parsePanelBg(value);
  const r = parseInt(b.color.slice(1, 3), 16);
  const g = parseInt(b.color.slice(3, 5), 16);
  const bl = parseInt(b.color.slice(5, 7), 16);
  return {
    backgroundColor: `rgba(${r}, ${g}, ${bl}, ${b.opacity / 100})`,
    border: b.border ? '1px solid rgba(255,255,255,0.25)' : undefined,
    backdropFilter: b.blur ? 'blur(12px)' : undefined,
    WebkitBackdropFilter: b.blur ? 'blur(12px)' : undefined,
  };
}
