interface Props {
  animated: boolean;
}

/** Height at which bubbles stop; the wave band and foam head sit above it. */
const FOAM_LINE = 78;

/** Height of the band the two wave layers slosh in, straddling the foam line. */
const WAVE_BAND = 9;

/**
 * Height of the solid foam head, as a percentage of the panel. Exported so the
 * panel can centre its content in the beer below it rather than in the whole
 * panel, which otherwise reads as sitting high.
 */
export const FOAM_HEIGHT = 100 - FOAM_LINE - WAVE_BAND + 1;

const BEER_BODY = 'linear-gradient(to top, #c87d05 0%, #eb9c07 55%, #f3ae1c 100%)';

const FOAM_BODY =
  'radial-gradient(circle at 18% 70%, rgba(255,255,255,0.9) 0 18%, transparent 19%),' +
  'radial-gradient(circle at 47% 40%, rgba(255,255,255,0.85) 0 14%, transparent 15%),' +
  'radial-gradient(circle at 78% 65%, rgba(255,255,255,0.9) 0 20%, transparent 21%),' +
  'linear-gradient(to top, #f4e6c8 0%, #fff9ed 60%)';

const SHEEN =
  'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.22) 45%,' +
  'rgba(255,255,255,0.05) 49%, transparent 55%)';

const BUBBLE_COUNT = 16;

/** A seamless wave tile, repeated twice across a double-width layer. */
function waveLayer(fill: string, height: number) {
  const d = `M0 ${height} L0 ${height / 2} C 25 0, 75 ${height}, 100 ${height / 2} S 175 0, 200 ${height / 2} L200 ${height} Z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 ${height}" preserveAspectRatio="none"><path d="${d}" fill="${fill}"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/**
 * Deterministic per-bubble jitter: the fractional part of a Knuth multiplicative
 * hash, so the bubble field looks random but never changes between renders.
 */
function jitter(i: number, salt: number) {
  const x = ((i + 1) * 2654435761 + salt * 40503) % 1000;
  return x / 1000;
}

const KEYFRAMES = `
  @keyframes info-beer-rise {
    0%   { transform: translate3d(0, 0, 0); opacity: 0; }
    12%  { opacity: 0.85; }
    82%  { opacity: 0.7; }
    100% { transform: translate3d(0, calc(-1 * var(--info-beer-travel)), 0); opacity: 0; }
  }
  @keyframes info-beer-sway {
    from { transform: translate3d(calc(-1 * var(--info-beer-drift)), 0, 0); }
    to   { transform: translate3d(var(--info-beer-drift), 0, 0); }
  }
  @keyframes info-beer-wave {
    from { transform: translate3d(0, 0, 0); }
    to   { transform: translate3d(-50%, 0, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-testid='beer-glass'] * { animation: none !important; }
  }
`;

/**
 * The beer-glass background of the beer panel: an amber body with rising
 * bubbles, a sloshing surface under a foam head, and a static glass sheen.
 * With `animated` off the same glass renders, just standing still.
 */
export default function BeerGlass({ animated }: Props) {
  return (
    <div data-testid="beer-glass" className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{KEYFRAMES}</style>

      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: `${FOAM_LINE + WAVE_BAND}%`, background: BEER_BODY }}
      />

      {animated && (
        <div
          data-testid="beer-bubbles"
          className="absolute inset-x-0 bottom-0 overflow-hidden"
          style={{ height: `${FOAM_LINE}%` }}
        >
          {Array.from({ length: BUBBLE_COUNT }, (_, i) => {
            const size = 3 + jitter(i, 1) * 6;
            const duration = 3.5 + jitter(i, 2) * 3.5;
            return (
              <span
                key={i}
                className="absolute inset-y-0 block"
                style={{
                  left: `${jitter(i, 3) * 96}%`,
                  width: `${size}px`,
                  ['--info-beer-travel' as string]: `${88 + jitter(i, 4) * 10}%`,
                  animation: `info-beer-rise ${duration}s linear ${-jitter(i, 5) * duration}s infinite`,
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                }}
              >
                <span
                  className="absolute bottom-0 left-0 block rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background:
                      'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(255,246,222,0.35) 70%)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
                    ['--info-beer-drift' as string]: `${2 + jitter(i, 6) * 6}px`,
                    animation: `info-beer-sway ${1.4 + jitter(i, 7) * 1.6}s ease-in-out infinite alternate`,
                  }}
                />
              </span>
            );
          })}
        </div>
      )}

      <div
        className="absolute inset-x-0 overflow-hidden"
        style={{ bottom: `${FOAM_LINE}%`, height: `${WAVE_BAND}%` }}
      >
        <div
          className="absolute inset-y-0 left-0 w-[200%]"
          style={{
            backgroundImage: waveLayer('#fff9ed', 20),
            backgroundSize: '50% 100%',
            backgroundRepeat: 'repeat-x',
            animation: animated ? 'info-beer-wave 11s linear infinite' : undefined,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        />
        <div
          className="absolute inset-y-0 left-0 w-[200%]"
          style={{
            backgroundImage: waveLayer('rgba(243,174,28,0.85)', 20),
            backgroundSize: '50% 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: '25% 0',
            animation: animated ? 'info-beer-wave 7s linear infinite reverse' : undefined,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 top-0"
        style={{ height: `${FOAM_HEIGHT}%`, background: FOAM_BODY }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: SHEEN,
          boxShadow:
            'inset 14px 0 22px -14px rgba(120,66,0,0.55), inset -14px 0 22px -14px rgba(120,66,0,0.55)',
        }}
      />
    </div>
  );
}
