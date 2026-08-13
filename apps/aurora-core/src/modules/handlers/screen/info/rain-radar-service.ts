import axios from 'axios';

export interface RainRadarResponse {
  /**
   * Unix timestamp (seconds) of the first sample.
   */
  start: number;
  /**
   * Seconds between samples.
   */
  interval: number;
  /**
   * Precipitation values in mm/h, one per interval.
   */
  precip: number[];
  /**
   * True when no rain is expected in the forecast window.
   */
  noRainExpected: boolean;
}

const DEFAULT_LAT = '51.447';
const DEFAULT_LON = '5.487';

/** Samples are 5 minutes apart. */
const INTERVAL_SECONDS = 300;
/** Below this mm/h the sample counts as "dry". */
const RAIN_THRESHOLD = 0.1;

/**
 * Fetches the short-term precipitation forecast for the configured location
 * (default: the GEWIS room in Eindhoven) from Buienradar's public rain-forecast
 * endpoint. The response is a plain-text list of `value|HH:MM` lines (24 samples,
 * 5 minutes apart, 2 hours ahead), where `value` is 0–255 on a logarithmic
 * scale. The legacy Buienalarm CDN (`cdn-secure.buienalarm.nl`) no longer exists.
 */
export default class RainRadarService {
  public async getForecast(lat: string = DEFAULT_LAT, lon: string = DEFAULT_LON): Promise<RainRadarResponse> {
    const { data } = await axios.get<string>(
      `https://gpsgadget.buienradar.nl/data/raintext?lat=${lat}&lon=${lon}`,
      { responseType: 'text' },
    );

    return RainRadarService.parse(data, new Date());
  }

  /**
   * Convert a Buienradar rain value (0–255) to mm/h. The documented formula is
   * `10 ^ ((value - 109) / 32)`; very small values are clamped to 0.
   */
  public static valueToMmh(value: number): number {
    if (Number.isNaN(value) || value <= 0) return 0;
    const mmh = 10 ** ((value - 109) / 32);
    return mmh < RAIN_THRESHOLD ? 0 : mmh;
  }

  /**
   * Pure parsing of the raintext body so it can be unit tested without a network
   * call. `now` anchors the `HH:MM` sample times to an absolute timestamp.
   */
  public static parse(body: string, now: Date = new Date()): RainRadarResponse {
    const lines = (body ?? '')
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const precip: number[] = [];
    let start = 0;

    lines.forEach((line, i) => {
      const [valueStr, timeStr] = line.split('|');
      precip.push(RainRadarService.valueToMmh(parseInt(valueStr, 10)));
      if (i === 0) start = RainRadarService.timeToEpoch(timeStr, now);
    });

    return {
      start,
      interval: INTERVAL_SECONDS,
      precip,
      noRainExpected: precip.every((p) => p < RAIN_THRESHOLD),
    };
  }

  /**
   * Resolve an `HH:MM` sample time to an absolute unix timestamp (seconds),
   * relative to `now`. If the time is more than a couple of hours in the past it
   * is assumed to belong to the next day (midnight rollover).
   */
  private static timeToEpoch(time: string | undefined, now: Date): number {
    const match = (time ?? '').match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return Math.floor(now.getTime() / 1000);
    const d = new Date(now);
    d.setHours(Number(match[1]), Number(match[2]), 0, 0);
    if (d.getTime() < now.getTime() - 2 * 60 * 60 * 1000) {
      d.setDate(d.getDate() + 1);
    }
    return Math.floor(d.getTime() / 1000);
  }
}
