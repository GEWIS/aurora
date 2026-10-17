import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getInfoRainRadar,
  getInfoWeather,
  RainRadarResponse,
  WeatherResponse,
} from '@gewis/aurora-api-client';
import { sBool, sNum, sStr, WidgetSettings } from '../settings';
import useCachedResource from '../useCachedResource';
import { WidgetHeaderSlotContext } from '../widgetHeaderSlot';
import WeatherWidget, { weatherIcon } from './WeatherWidget';
import RainRadarChart from './RainRadarChart';

interface Props {
  weather: WeatherResponse | null;
  radar: RainRadarResponse | null;
  settings?: WidgetSettings;
}

/**
 * Weather forecast for a per-widget lat/lon location, in one of two modes:
 * `timeline` shows the precipitation chart, plus (with `showTemperature`) a compact
 * icon + temperature on the right of the card's title row, or above the chart
 * when there is no title; `summary` shows only the current conditions (icon +
 * temperature + optional wind/humidity/pressure).
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
  const showTemperature = sBool(settings, 'showTemperature', false);
  const lat = sNum(settings, 'latitude', BROADCAST_LAT);
  const lon = sNum(settings, 'longitude', BROADCAST_LON);
  const followsBroadcast = lat === BROADCAST_LAT && lon === BROADCAST_LON;
  const headerSlot = useContext(WidgetHeaderSlotContext);

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

  const current = showTemperature && weather && (
    <div className="flex items-center gap-2 font-raleway text-white text-shadow">
      <FontAwesomeIcon
        icon={weatherIcon(weather.description)}
        className="text-2xl text-sky-200"
        title={weather.description ?? undefined}
      />
      <span className="text-2xl font-semibold tabular-nums">
        {weather.temperature != null ? `${Math.round(weather.temperature)}°` : '--'}
      </span>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {current &&
        (headerSlot ? (
          createPortal(current, headerSlot)
        ) : (
          <div className="mb-2 flex shrink-0 justify-end">{current}</div>
        ))}
      <div className="min-h-0 flex-1">
        <RainRadarChart radar={radar} />
      </div>
    </div>
  );
}
