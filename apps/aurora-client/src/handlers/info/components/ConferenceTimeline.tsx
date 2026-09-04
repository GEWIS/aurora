import { useEffect, useState } from 'react';
import { ConferenceRoomsResponse } from '@gewis/aurora-api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
  rooms: ConferenceRoomsResponse;
}

/** Hours shown in the timeline window. */
const WINDOW_HOURS = 4;

/**
 * Per-room availability timeline: a green base bar with red busy segments over a
 * 4-hour window (from the current hour), an hour axis, a "now" marker, and a
 * status icon per room. Mirrors the sketch.
 */
export default function ConferenceTimeline({ rooms }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  const windowStart = start.getTime();
  const windowMs = WINDOW_HOURS * 3_600_000;
  const pct = (t: number) => Math.max(0, Math.min(100, ((t - windowStart) / windowMs) * 100));
  const nowPct = pct(now.getTime());

  const ticks = Array.from({ length: WINDOW_HOURS + 1 }, (_, i) => ({
    left: (i / WINDOW_HOURS) * 100,
    label: new Date(windowStart + i * 3_600_000).getHours(),
  }));

  return (
    <div className="flex h-full min-h-0 flex-col font-raleway text-white text-shadow">
      <div className="mb-2 shrink-0 text-2xl font-semibold">{rooms.summary}</div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* hour axis, aligned with the bars column */}
        <div className="flex shrink-0 text-sm text-white/60">
          <div className="w-40 shrink-0" />
          <div className="relative h-5 flex-1">
            {ticks.map((t) => (
              <span
                key={t.left}
                className="absolute -translate-x-1/2 tabular-nums"
                style={{ left: `${t.left}%` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* rooms: labels column + a single bars column (so the now-line spans all) */}
        <div className="flex min-h-0 flex-1">
          <div className="flex w-40 shrink-0 flex-col">
            {rooms.rooms.map((room) => (
              <div key={room.number} className="flex flex-1 items-center gap-2 pr-2">
                <FontAwesomeIcon
                  icon={room.available ? faCircleCheck : faCircleXmark}
                  className={`shrink-0 text-lg ${room.available ? 'text-green-400' : 'text-red-400'}`}
                />
                <span className="truncate text-lg">{room.number}</span>
              </div>
            ))}
          </div>

          <div className="relative min-w-0 flex-1">
            {/* now marker across all rows */}
            <div
              className="absolute inset-y-0 z-10 border-l-2 border-dashed border-white/80"
              style={{ left: `${nowPct}%` }}
            />
            <div className="flex h-full flex-col">
              {rooms.rooms.map((room) => (
                <div key={room.number} className="flex flex-1 items-center py-1">
                  <div className="relative h-4 w-full overflow-hidden rounded bg-green-500/70">
                    {room.busy.map((seg, i) => {
                      const l = pct(new Date(seg.start).getTime());
                      const r = pct(new Date(seg.end).getTime());
                      if (r <= l) return null;
                      return (
                        <div
                          key={`${seg.start}-${i}`}
                          className="absolute inset-y-0 bg-red-500/85"
                          style={{ left: `${l}%`, width: `${r - l}%` }}
                        />
                      );
                    })}
                    {/* dim the past */}
                    <div
                      className="absolute inset-y-0 left-0 bg-black/40"
                      style={{ width: `${nowPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
