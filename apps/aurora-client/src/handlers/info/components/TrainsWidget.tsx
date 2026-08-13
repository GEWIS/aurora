import { getInfoTrains, TrainResponse } from '@gewis/aurora-api-client';
import VerticalScroll from '../../../components/VerticalScroll';
import { sBool, sStr, WidgetSettings } from '../settings';
import useCachedResource from '../useCachedResource';

interface Props {
  trains: TrainResponse[];
  settings?: WidgetSettings;
}

function departureTime(train: TrainResponse): string {
  const date = new Date(train.plannedDateTime);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export default function TrainsWidget({ trains: initialTrains, settings }: Props) {
  const showDelays = sBool(settings, 'showDelays', true);
  const station = sStr(settings, 'station', 'EHV');

  // Self-fetch departures for the configured station (per-widget setting). The
  // broadcast prop is only the initial value, until the first response lands.
  const trains = useCachedResource(
    `trains:${station}`,
    async () => (await getInfoTrains({ query: { station } })).data,
    30_000,
    initialTrains,
  );

  return (
    <VerticalScroll visible items={trains.length} scrollEmptySpace>
      <div className="flex flex-col gap-2 font-raleway text-white">
        {trains.length === 0 && <div className="text-white/60 text-2xl">No departures</div>}
        {trains.map((train, i) => (
          <div
            key={`${train.plannedDateTime}-${train.direction}-${i}`}
            className="flex items-baseline gap-3 text-2xl"
          >
            <span className="w-20 tabular-nums font-semibold">{departureTime(train)}</span>
            {showDelays && train.delay > 0 && (
              <span className="text-red-400 tabular-nums text-xl">+{train.delay}</span>
            )}
            <span className={`flex-1 truncate ${train.cancelled ? 'line-through opacity-50' : ''}`}>
              {train.direction}
            </span>
            <span className="text-white/60 text-lg uppercase">{train.trainType}</span>
          </div>
        ))}
      </div>
    </VerticalScroll>
  );
}
