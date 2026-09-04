import axios from 'axios';

export interface WeatherResponse {
  station: string;
  temperature: number | null;
  windBft: number | null;
  humidity: number | null;
  pressure: number | null;
  description: string | null;
  iconUrl: string | null;
}

interface BuienradarStation {
  stationname: string;
  lat?: number;
  lon?: number;
  temperature?: number;
  windspeedBft?: number;
  humidity?: number;
  airpressure?: number;
  weatherdescription?: string;
  iconurl?: string;
}

const FEED_URL = 'https://data.buienradar.nl/2.0/feed/json';
const DEFAULT_LAT = 51.447;
const DEFAULT_LON = 5.487;

/**
 * Fetches current weather from the public Buienradar JSON feed, selecting the
 * measurement station nearest to the given coordinates (default: the GEWIS room
 * in Eindhoven). Location is passed per-widget rather than via env vars.
 */
export default class WeatherService {
  public async getWeather(
    lat: number = DEFAULT_LAT,
    lon: number = DEFAULT_LON,
  ): Promise<WeatherResponse> {
    const { data } = await axios.get(FEED_URL);
    const stations: BuienradarStation[] = data?.actual?.stationmeasurements ?? [];
    return WeatherService.parseNearest(stations, lat, lon);
  }

  /**
   * Pure selection/mapping so it can be unit tested without a network call:
   * picks the station nearest to (lat, lon) by squared coordinate distance.
   */
  public static parseNearest(
    stations: BuienradarStation[],
    lat: number,
    lon: number,
  ): WeatherResponse {
    const located = stations.filter((s) => typeof s.lat === 'number' && typeof s.lon === 'number');
    const pool = located.length > 0 ? located : stations;

    let nearest: BuienradarStation | undefined = pool[0];
    let best = Infinity;
    for (const s of located) {
      const d = (s.lat! - lat) ** 2 + (s.lon! - lon) ** 2;
      if (d < best) {
        best = d;
        nearest = s;
      }
    }

    if (!nearest) {
      return {
        station: 'Unknown',
        temperature: null,
        windBft: null,
        humidity: null,
        pressure: null,
        description: null,
        iconUrl: null,
      };
    }

    return {
      station: nearest.stationname,
      temperature: nearest.temperature ?? null,
      windBft: nearest.windspeedBft ?? null,
      humidity: nearest.humidity ?? null,
      pressure: nearest.airpressure ?? null,
      description: nearest.weatherdescription ?? null,
      iconUrl: nearest.iconurl ?? null,
    };
  }
}
