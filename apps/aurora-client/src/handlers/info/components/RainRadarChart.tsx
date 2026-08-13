import { useMemo } from 'react';
import { RainRadarResponse } from '@gewis/aurora-api-client';

interface Props {
  radar: RainRadarResponse | null;
}

const WIDTH = 1000;
const HEIGHT = 300;
const PADDING = 24;

/**
 * Lightweight dependency-free SVG area chart of the short-term precipitation
 * forecast (mm/h). Replaces the legacy Google Charts rain radar.
 */
export default function RainRadarChart({ radar }: Props) {
  const { areaPath, linePath, labels } = useMemo(() => {
    if (!radar || radar.precip.length === 0) {
      return { areaPath: '', linePath: '', labels: [] as { x: number; text: string }[] };
    }

    const maxPrecip = Math.max(1, ...radar.precip);
    const n = radar.precip.length;
    const innerW = WIDTH - PADDING * 2;
    const innerH = HEIGHT - PADDING * 2;

    const x = (i: number) => PADDING + (i / (n - 1)) * innerW;
    const y = (v: number) => PADDING + innerH - (v / maxPrecip) * innerH;

    const points = radar.precip.map((v, i) => `${x(i)},${y(v)}`);
    const line = `M ${points.join(' L ')}`;
    const area = `${line} L ${x(n - 1)},${PADDING + innerH} L ${x(0)},${PADDING + innerH} Z`;

    const labelCount = 4;
    const times: { x: number; text: string }[] = [];
    for (let k = 0; k <= labelCount; k += 1) {
      const i = Math.round((k / labelCount) * (n - 1));
      const date = new Date((radar.start + i * radar.interval) * 1000);
      times.push({
        x: x(i),
        text: `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      });
    }

    return { areaPath: area, linePath: line, labels: times };
  }, [radar]);

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Only the paths are stretched; the axis labels are crisp HTML below. */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="min-h-0 w-full flex-1"
      >
        <defs>
          <linearGradient id="rain-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#rain-gradient)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#7dd3fc"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {labels.length > 0 && (
        <div className="mt-1 flex shrink-0 justify-between font-raleway text-sm text-slate-300">
          {labels.map((l) => (
            <span key={l.text + l.x}>{l.text}</span>
          ))}
        </div>
      )}
      {radar?.noRainExpected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-md bg-black/40 px-4 py-2 font-raleway text-2xl text-white">
            No rain expected
          </span>
        </div>
      )}
    </div>
  );
}
