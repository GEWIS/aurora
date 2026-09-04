/** Panel background composite: `"#rrggbb|opacity|border|blur"`. */
export interface PanelBg {
  /** Hex colour WITHOUT the leading '#'. */
  hex: string;
  opacity: number; // 0–100
  border: boolean;
  blur: boolean;
}

export function parseBg(value?: string): PanelBg {
  const m = /^#([0-9a-fA-F]{6})\|(\d{1,3})\|([01])\|([01])$/.exec(value ?? '');
  if (!m) return { hex: '374151', opacity: 50, border: true, blur: true };
  return {
    hex: m[1],
    opacity: Math.min(100, Math.max(0, Number(m[2]))),
    border: m[3] === '1',
    blur: m[4] === '1',
  };
}

export function encodeBg(p: PanelBg): string {
  return `#${p.hex}|${Math.round(p.opacity)}|${p.border ? 1 : 0}|${p.blur ? 1 : 0}`;
}

export function rgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

/** Inline style for a panel background preview (transparent when omitted). */
export function bgStyle(value?: string): Record<string, string> {
  if (!value) return { background: 'transparent' };
  const p = parseBg(value);
  const style: Record<string, string> = { backgroundColor: rgba(p.hex, p.opacity) };
  if (p.border) style.border = '1px solid rgba(255,255,255,0.25)';
  if (p.blur) style.backdropFilter = 'blur(6px)';
  return style;
}
