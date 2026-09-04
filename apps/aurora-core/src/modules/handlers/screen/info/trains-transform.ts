import { TrainResponse } from '../poster/ns-trains-service';

const TREINLIMBO_DESTINATIONS = ['maastricht', 'heerlen'];

/**
 * Legacy easter egg: trains towards Maastricht or Heerlen are rebranded as the
 * "TreinLimbo Express". Applied only on the info screen layer so the shared
 * NsTrainsService (used by the poster train widget) is unaffected.
 */
export function applyTreinLimbo(trains: TrainResponse[]): TrainResponse[] {
  const rename = (name: string): string => {
    const match = TREINLIMBO_DESTINATIONS.find((d) => name.toLowerCase().includes(d));
    if (!match) return name;
    const pretty = match.charAt(0).toUpperCase() + match.slice(1);
    return `TreinLimbo Express ${pretty}`;
  };

  return trains.map((train) => ({
    ...train,
    direction: rename(train.direction),
    routeStations: train.routeStations.map(rename),
  }));
}
