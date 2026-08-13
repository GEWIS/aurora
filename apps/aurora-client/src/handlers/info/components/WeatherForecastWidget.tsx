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
export default function WeatherForecastWidget({
  weather: initialWeather,
  radar: initialRadar,
  settings,
}: Props) {
  const mode = sStr(settings, 'mode', 'timeline');
  const lat = sNum(settings, 'latitude', 51.447);
  const lon = sNum(settings, 'longitude', 5.487);

  const weather = useCachedResource<WeatherResponse | null>(
    `weather:${lat},${lon}`,
    async () => (await getInfoWeather({ query: { lat, lon } })).data,
    60_000,
    initialWeather,
  );
  const radar = useCachedResource<RainRadarResponse | null>(
    `rain-radar:${lat},${lon}`,
    async () => (await getInfoRainRadar({ query: { lat: String(lat), lon: String(lon) } })).data,
    60_000,
    initialRadar,
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
