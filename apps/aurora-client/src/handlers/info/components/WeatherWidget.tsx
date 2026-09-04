import { WeatherResponse } from '@gewis/aurora-api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faCloud,
  faCloudMeatball,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudSun,
  faSmog,
  faSnowflake,
  faSun,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { sBool, WidgetSettings } from '../settings';

interface Props {
  weather: WeatherResponse | null;
  settings?: WidgetSettings;
}

/** Map the (Dutch) Buienradar weather description to a FontAwesome icon. */
function weatherIcon(description: string | null): IconDefinition {
  const d = (description ?? '').toLowerCase();
  if (/onweer|thunder/.test(d)) return faBolt;
  if (/sneeuw|snow/.test(d)) return faSnowflake;
  if (/hagel|hail/.test(d)) return faCloudMeatball;
  if (/regen|motregen|rain|drizzle/.test(d)) return faCloudShowersHeavy;
  if (/buien|shower/.test(d)) return faCloudRain;
  if (/mist|nevel|fog|haze/.test(d)) return faSmog;
  if (/zwaar bewolkt|betrokken|overcast/.test(d)) return faCloud;
  if (/(half|licht) bewolkt|partly|cloud/.test(d)) return faCloudSun;
  if (/zonnig|onbewolkt|helder|clear|sunny/.test(d)) return faSun;
  return faCloudSun;
}

export default function WeatherWidget({ weather, settings }: Props) {
  const showDetails = sBool(settings, 'showDetails', true);
  const showEmoji = sBool(settings, 'showEmoji', true);

  if (!weather) {
    return <div className="text-white/60 font-raleway text-2xl">Weather unavailable</div>;
  }

  return (
    <div className="flex items-center gap-4 text-white font-raleway text-shadow">
      {showEmoji && (
        <FontAwesomeIcon
          icon={weatherIcon(weather.description)}
          className="text-6xl text-sky-200"
          title={weather.description ?? undefined}
        />
      )}
      <div className="flex flex-col leading-tight">
        <div className="text-5xl font-semibold tabular-nums">
          {weather.temperature != null ? `${Math.round(weather.temperature)}°` : '--'}
        </div>
        {showDetails && (
          <div className="text-lg opacity-80">
            {[
              weather.windBft != null ? `${weather.windBft} Bft` : null,
              weather.humidity != null ? `${weather.humidity}%` : null,
              weather.pressure != null ? `${Math.round(weather.pressure)} hPa` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}
