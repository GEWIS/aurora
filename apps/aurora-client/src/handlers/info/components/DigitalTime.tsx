import { CSSProperties } from 'react';

interface Props {
  /** A time-like string, e.g. "02:05:03", "-44:00:00" or "05:12". */
  value: string;
  className?: string;
  style?: CSSProperties;
}

/** Per-character cell widths (in em) so the layout never shifts as digits change. */
const CHAR_WIDTH: Record<string, number> = {
  ':': 0.32,
  '+': 0.45,
  '-': 0.45,
};

function charWidth(ch: string): number {
  return CHAR_WIDTH[ch] ?? 0.62;
}

/** Total width (in em) the rendered value occupies, for callers that size the font to fit. */
export function timeEmWidth(value: string): number {
  return [...value].reduce((total, ch) => total + charWidth(ch), 0);
}

/**
 * Renders a time string with every character in a fixed-width cell, so the
 * colons (and any leading icon/label) stay put instead of jittering each second
 * — independent of whether the font provides tabular figures.
 */
export default function DigitalTime({ value, className, style }: Props) {
  return (
    <span className={`inline-flex tabular-nums ${className ?? ''}`} style={style}>
      {[...value].map((ch, i) => (
        <span key={i} className="inline-block text-center" style={{ width: `${charWidth(ch)}em` }}>
          {ch}
        </span>
      ))}
    </span>
  );
}
