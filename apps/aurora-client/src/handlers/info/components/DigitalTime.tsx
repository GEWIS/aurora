interface Props {
  /** A time-like string, e.g. "02:05:03", "-44:00:00" or "05:12". */
  value: string;
  className?: string;
}

/** Per-character cell widths (in em) so the layout never shifts as digits change. */
const CHAR_WIDTH: Record<string, string> = {
  ':': '0.32em',
  '+': '0.45em',
  '-': '0.45em',
};

function charWidth(ch: string): string {
  return CHAR_WIDTH[ch] ?? '0.62em';
}

/**
 * Renders a time string with every character in a fixed-width cell, so the
 * colons (and any leading icon/label) stay put instead of jittering each second
 * — independent of whether the font provides tabular figures.
 */
export default function DigitalTime({ value, className }: Props) {
  return (
    <span className={`inline-flex tabular-nums ${className ?? ''}`}>
      {[...value].map((ch, i) => (
        <span key={i} className="inline-block text-center" style={{ width: charWidth(ch) }}>
          {ch}
        </span>
      ))}
    </span>
  );
}
