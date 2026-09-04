import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Screen background. The `variant` (chosen per-screen in the backoffice) selects
 * between the full hexagon wallpaper, a softer colour gradient, a line grid, a
 * flat dark fill, or nothing. A modern take on the legacy infoscherm's
 * `congruent_outline` geometric wallpaper.
 */
export type BackgroundVariant = 'hexagons' | 'gradient' | 'grid' | 'color' | 'image';

interface Props {
  variant?: BackgroundVariant;
  /** Image URL used when `variant` is 'image'. */
  image?: string;
  /** Solid colour (hex) used when `variant` is 'color'. */
  color?: string;
}

const POLYGONS = [
  {
    left: '-6%',
    top: '-10%',
    size: '46vw',
    color: '#c8102e',
    opacity: 0.32,
    drift: 60,
    duration: 90,
  },
  {
    left: '58%',
    top: '-14%',
    size: '38vw',
    color: '#4f46e5',
    opacity: 0.28,
    drift: 80,
    duration: 120,
  },
  {
    left: '68%',
    top: '46%',
    size: '44vw',
    color: '#0ea5b5',
    opacity: 0.26,
    drift: 70,
    duration: 105,
  },
  {
    left: '-8%',
    top: '52%',
    size: '40vw',
    color: '#7c3aed',
    opacity: 0.24,
    drift: 90,
    duration: 135,
  },
];

const HEXAGON = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

/** Deterministic pseudo-random so the "procedural" cells are stable per load. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function GeometricBackground({ variant = 'hexagons', image, color }: Props) {
  // Procedurally scatter a handful of pulsing accent hexagons across the grid.
  const cells = useMemo(() => {
    const rand = seeded(0x5eed);
    return Array.from({ length: 14 }, () => ({
      left: `${(rand() * 100).toFixed(1)}%`,
      top: `${(rand() * 100).toFixed(1)}%`,
      size: 40 + Math.round(rand() * 90),
      delay: rand() * 6,
      duration: 4 + rand() * 6,
      color: ['#c8102e', '#4f46e5', '#0ea5b5', '#e2e8f0'][Math.floor(rand() * 4)],
    }));
  }, []);

  // Solid colour background.
  if (variant === 'color') {
    return (
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ backgroundColor: color ?? '#0b1020' }}
      />
    );
  }

  // Custom image background: cover the screen, with a dark scrim for legibility.
  if (variant === 'image' && image) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      </div>
    );
  }

  const showPolygons = variant === 'hexagons' || variant === 'gradient';
  const showHexTiling = variant === 'hexagons';
  const showGrid = variant === 'grid';

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* base depth glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(70,84,150,0.35),transparent_65%)]" />

      {/* drifting blurred polygons for colour depth */}
      {showPolygons &&
        POLYGONS.map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ rotate: 360, x: [0, p.drift, 0], y: [0, -p.drift, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="h-full w-full blur-3xl"
              style={{ background: p.color, opacity: p.opacity, clipPath: HEXAGON }}
            />
          </motion.div>
        ))}

      {/* infinite hexagon tiling (Hero Patterns "hexagons") */}
      {showHexTiling && (
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.11]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="info-hexagons"
              width="28"
              height="49"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(2.2)"
            >
              <path
                fill="none"
                stroke="white"
                strokeWidth="1"
                d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM0 15l12.98-7.5V0M0 34l12.98 7.5V49M28 15l-12.99-7.5V0M28 34l-12.99 7.5V49"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#info-hexagons)" />
        </svg>
      )}

      {/* line grid */}
      {showGrid && (
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.1]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="info-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path fill="none" stroke="white" strokeWidth="1" d="M48 0H0V48" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#info-grid)" />
        </svg>
      )}

      {/* procedurally scattered pulsing accent hexagons */}
      {showHexTiling &&
        cells.map((c, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: c.left,
              top: c.top,
              width: c.size,
              height: c.size,
              background: c.color,
              clipPath: HEXAGON,
            }}
            animate={{ opacity: [0, 0.16, 0] }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* vignette so widgets stay legible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
