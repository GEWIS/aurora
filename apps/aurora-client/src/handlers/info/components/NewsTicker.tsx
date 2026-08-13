import { useMemo } from 'react';
import { NewsHeadline } from '@gewis/aurora-api-client';
import { sBool, sList, sNum, sStr, WidgetSettings } from '../settings';

interface Props {
  headlines: NewsHeadline[];
  settings?: WidgetSettings;
}

/** Characters scrolled past per second, per speed setting (reading pace). */
const CHARS_PER_SECOND: Record<string, number> = { slow: 4, normal: 7, fast: 12 };

/** Sources emitted for the satirical GEWIS easter-egg headlines. */
const SATIRE_SOURCES = new Set(['GEWIS', 'SudoSOS']);

/**
 * Whether a headline is shown: satire headlines follow the `sourceSatire` toggle;
 * real headlines follow the per-widget source selection (`selected`, by source
 * id; empty = all).
 */
function headlineEnabled(h: NewsHeadline, settings: WidgetSettings | undefined, selected: string[]): boolean {
  if (SATIRE_SOURCES.has(h.source)) return sBool(settings, 'sourceSatire', true);
  if (selected.length === 0) return true;
  return h.sourceId != null && selected.includes(String(h.sourceId));
}

/**
 * Order headlines either interleaved (round-robin across sources so they
 * alternate) or grouped by source (all of one source, then the next).
 */
function orderHeadlines(list: NewsHeadline[], interleave: boolean): NewsHeadline[] {
  const groups = new Map<string, NewsHeadline[]>();
  for (const h of list) {
    const g = groups.get(h.source) ?? [];
    g.push(h);
    groups.set(h.source, g);
  }
  const buckets = [...groups.values()];
  if (!interleave) return buckets.flat();

  const out: NewsHeadline[] = [];
  for (let i = 0; out.length < list.length; i += 1) {
    for (const bucket of buckets) if (i < bucket.length) out.push(bucket[i]);
  }
  return out;
}

/**
 * Horizontally scrolling news ticker. The content track is duplicated so the
 * marquee loops seamlessly. The duration is derived from the total text length
 * so the scroll speed stays constant regardless of how many headlines there are
 * — deterministic from props, so no layout measurement or state is needed.
 */
export default function NewsTicker({ headlines, settings }: Props) {
  const speed = sStr(settings, 'speed', 'normal');
  const interleave = sBool(settings, 'interleave', true);
  const maxItems = sNum(settings, 'maxItems', 20);

  const selected = sList(settings, 'sources');
  const visible = useMemo(() => {
    const filtered = headlines.filter((h) => headlineEnabled(h, settings, selected));
    return orderHeadlines(filtered, interleave).slice(0, Math.max(1, maxItems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headlines, settings, interleave, maxItems, selected.join(',')]);

  const duration = useMemo(() => {
    const cps = CHARS_PER_SECOND[speed] ?? CHARS_PER_SECOND.normal;
    const chars = visible.reduce((sum, h) => sum + h.source.length + h.title.length + 8, 0);
    return Math.max(20, chars / cps);
  }, [visible, speed]);

  if (visible.length === 0) return null;

  const track = (
    <div className="flex shrink-0 items-center">
      {visible.map((headline, i) => (
        <span key={`${headline.source}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="mx-4 text-white/50">{headline.source}</span>
          <span>{headline.title}</span>
          <span className="mx-6 text-white/40">•</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden font-raleway text-2xl text-white text-shadow">
      <style>
        {`@keyframes info-news-marquee {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
          }`}
      </style>
      <div
        className="flex w-max"
        style={{
          animation: `info-news-marquee ${duration}s linear infinite`,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {track}
        {track}
      </div>
    </div>
  );
}
