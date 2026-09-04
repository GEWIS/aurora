interface Props {
  hours: number;
  minutes: number;
  seconds: number;
  showSeconds?: boolean;
}

/**
 * A simple SVG analog clock face. Sized to fill its container while staying
 * square (viewBox 100×100).
 */
export default function AnalogClock({ hours, minutes, seconds, showSeconds = true }: Props) {
  const h12 = hours % 12;

  const secondAngle = seconds * 6; // 360 / 60
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = h12 * 30 + minutes * 0.5; // 360 / 12

  const hand = (angle: number, length: number, width: number, color: string, key: string) => (
    <line
      key={key}
      x1="50"
      y1="50"
      x2="50"
      y2={50 - length}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      transform={`rotate(${angle} 50 50)`}
    />
  );

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full max-h-full w-auto max-w-full">
        <circle cx="50" cy="50" r="47" fill="rgba(0,0,0,0.25)" stroke="white" strokeWidth="1.5" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="6"
            x2="50"
            y2={i % 3 === 0 ? 13 : 10}
            stroke="white"
            strokeWidth={i % 3 === 0 ? 2 : 1}
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        {hand(hourAngle, 24, 3, 'white', 'h')}
        {hand(minuteAngle, 34, 2, 'white', 'm')}
        {showSeconds && hand(secondAngle, 38, 1, '#f87171', 's')}
        <circle cx="50" cy="50" r="2.5" fill="white" />
      </svg>
    </div>
  );
}
