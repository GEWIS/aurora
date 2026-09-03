import {
  getInfoRainRadar,
  getInfoWeather,
  RainRadarResponse,
  WeatherResponse,
} from '@gewis/aurora-api-client';
import { sNum, sStr, WidgetSettings } from '../settings';
import useCachedResource from '../useCachedResource';
import WeatherWidget from './WeatherWidget';
import RainRadarChart from './RainRadarChart';

interface Props {
  weather: WeatherResponse | null;
  radar: RainRadarResponse | null;
  settings?: WidgetSettings;
}

/**
 * Weather forecast for a per-widget lat/lon location, in one of two modes:
 * `timeline` shows only the precipitation chart; `summary` shows only the
 * current conditions (icon + temperature + optional wind/humidity/pressure).
 * Multiple instances can show different places. The broadcast props are only the
 * initial value.
 */
/**
 * The location the core polls for its screen-wide broadcast, which is also this
 * widget's default. A widget left on it can start from the broadcast; one
 * pointed elsewhere must not, or it would show this location's weather under
 * another place's heading until its own response lands.
 */
const BROADCAST_LAT = 51.447;
const BROADCAST_LON = 5.487;

export default function WeatherForecastWidget({
  weather: initialWeather,
  radar: initialRadar,
  settings,
}: Props) {
  const mode = sStr(settings, 'mode', 'timeline');
  const lat = sNum(settings, 'latitude', BROADCAST_LAT);
  const lon = sNum(settings, 'longitude', BROADCAST_LON);
  const followsBroadcast = lat === BROADCAST_LAT && lon === BROADCAST_LON;

  const weather = useCachedResource<WeatherResponse | null>(
    `weather:${lat},${lon}`,
    async () => (await getInfoWeather({ query: { lat, lon } })).data,
    60_000,
    followsBroadcast ? initialWeather : null,
  );
  const radar = useCachedResource<RainRadarResponse | null>(
    `rain-radar:${lat},${lon}`,
    async () => (await getInfoRainRadar({ query: { lat: String(lat), lon: String(lon) } })).data,
    60_000,
    followsBroadcast ? initialRadar : null,
  );

  if (mode === 'summary') {
    return (
      <div className="flex h-full items-center">
        <WeatherWidget weather={weather} settings={settings} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <RainRadarChart radar={radar} />
    </div>
  );
}
