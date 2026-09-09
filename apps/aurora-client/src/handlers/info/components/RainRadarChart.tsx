import { useMemo } from 'react';
import { RainRadarResponse } from '@gewis/aurora-api-client';

interface Props {
  radar: RainRadarResponse | null;
}

const WIDTH = 1000;
const HEIGHT = 300;
const PADDING = 24;

/**
 * Candidate axis maxima in mm/h. Snapping the domain to one of these keeps the
 * ticks on round numbers and stops the scale from rebasing on every refresh.
 */
const SCALE_STEPS = [1, 2, 5, 10, 20, 50, 100];

function niceMax(observed: number): number {
  return SCALE_STEPS.find((step) => step >= observed) ?? Math.ceil(observed / 100) * 100;
}

function formatTick(value: number): string {
  return Number(value.toFixed(1)).toString();
}

/**
 * Lightweight dependency-free SVG area chart of the short-term precipitation
 * forecast (mm/h). Replaces the legacy Google Charts rain radar.
 */
export default function RainRadarChart({ radar }: Props) {
  const { areaPath, linePath, labels, yTicks } = useMemo(() => {
    const empty = {
      areaPath: '',
      linePath: '',
      labels: [] as { x: number; text: string }[],
      yTicks: [] as { top: number; y: number; text: string }[],
    };
    if (!radar || radar.precip.length < 2) {
      return empty;
    }

    const maxPrecip = niceMax(Math.max(1, ...radar.precip));
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

    const ticks = [maxPrecip, maxPrecip / 2, 0].map((v, k) => ({
      top: (y(v) / HEIGHT) * 100,
      y: y(v),
      text: k === 0 ? `${formatTick(v)} mm/h` : formatTick(v),
    }));

    return { areaPath: area, linePath: line, labels: times, yTicks: ticks };
  }, [radar]);

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Only the paths are stretched; the axis labels are crisp HTML on top. */}
      <div className="relative flex min-h-0 flex-1">
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
          {yTicks.map((t) => (
            <line
              key={t.text}
              x1={PADDING}
              x2={WIDTH - PADDING}
              y1={t.y}
              y2={t.y}
              stroke="#ffffff"
              strokeOpacity={0.12}
              strokeWidth={1}
              strokeDasharray="6 6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
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
        <div className="pointer-events-none absolute inset-0 font-raleway text-xs text-slate-300 text-shadow">
          {yTicks.map((t) => (
            <span
              key={t.text}
              className="absolute left-0 -translate-y-1/2 tabular-nums"
              style={{ top: `${t.top}%` }}
            >
              {t.text}
            </span>
          ))}
        </div>
      </div>
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
