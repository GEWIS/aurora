import axios from 'axios';
import CalendarService from './calendar-service';
import NewsService from './news-service';
import NsTrainsService from '../poster/ns-trains-service';
import ServicesHealthService from './services-health-service';

export interface ValidationParams {
  /** Which check to run. */
  kind: 'ical' | 'rss' | 'station' | 'image' | 'url' | 'status-api';
  /** The value to validate (URL, station code, …). */
  value: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

const TIMEOUT = 10_000;
const MAX_BYTES = 25_000_000;

/**
 * Runs a "does this actually work" check for a widget/entity field before it is
 * saved to a live screen. Reuses the same parsers the running widgets use, so a
 * green result means the real feed/lookup will succeed.
 */
export default class ValidationService {
  public async validate({ kind, value }: ValidationParams): Promise<ValidationResult> {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return { valid: false, message: 'The value is empty.' };
    switch (kind) {
      case 'ical':
        return this.validateIcal(trimmed);
      case 'rss':
        return this.validateRss(trimmed);
      case 'station':
        return this.validateStation(trimmed);
      case 'image':
        return this.validateImage(trimmed);
      case 'url':
        return this.validateUrl(trimmed);
      case 'status-api':
        return this.validateStatusApi(trimmed);
      default:
        return { valid: false, message: 'Unknown validation type.' };
    }
  }

  private async validateIcal(url: string): Promise<ValidationResult> {
    try {
      const { data } = await axios.get<string>(url, { responseType: 'text', timeout: TIMEOUT });
      const events = CalendarService.parse(data);
      return { valid: true, message: `Calendar OK — ${events.length} event(s) parsed.` };
    } catch (e) {
      return { valid: false, message: `Could not fetch/parse the calendar: ${errMessage(e)}` };
    }
  }

  private async validateRss(url: string): Promise<ValidationResult> {
    try {
      const { data } = await axios.get<string>(url, { responseType: 'text', timeout: TIMEOUT });
      const headlines = NewsService.parseRss(data, 'test');
      if (headlines.length === 0) {
        return { valid: false, message: 'Feed reachable, but no headlines were found.' };
      }
      return { valid: true, message: `Feed OK — ${headlines.length} headline(s).` };
    } catch (e) {
      return { valid: false, message: `Could not fetch the feed: ${errMessage(e)}` };
    }
  }

  private async validateStation(code: string): Promise<ValidationResult> {
    try {
      const trains = await new NsTrainsService().getTrains(code);
      return { valid: true, message: `Station OK — ${trains.length} upcoming departure(s).` };
    } catch (e) {
      return {
        valid: false,
        message: `Station lookup failed (check the code and NS_KEY): ${errMessage(e)}`,
      };
    }
  }

  private async validateImage(url: string): Promise<ValidationResult> {
    try {
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: TIMEOUT,
        maxContentLength: MAX_BYTES,
      });
      const type = String(res.headers['content-type'] ?? '');
      if (!type.startsWith('image/')) {
        return {
          valid: false,
          message: `Reachable, but not an image (${type || 'unknown type'}).`,
        };
      }
      return { valid: true, message: `Image OK (${type}).` };
    } catch (e) {
      return { valid: false, message: `Could not fetch the image: ${errMessage(e)}` };
    }
  }

  /**
   * Check a status URL by actually reading it, reporting which backend was
   * detected so a typo'd URL that happens to answer is easy to spot.
   */
  private async validateStatusApi(url: string): Promise<ValidationResult> {
    try {
      const { provider } = await ServicesHealthService.resolve(url);
      const label = provider === 'gatus' ? 'Gatus' : 'Uptime Kuma';
      const health = await new ServicesHealthService().getHealth(url);
      const monitors = health.groups.reduce((n, g) => n + g.services.length, 0);
      if (monitors === 0) {
        return { valid: false, message: `${label} reachable, but it exposes no monitors.` };
      }
      return {
        valid: true,
        message: `${label} OK — ${monitors} monitor(s) in ${health.groups.length} group(s).`,
      };
    } catch (e) {
      return { valid: false, message: `Could not read the status API: ${errMessage(e)}` };
    }
  }

  private async validateUrl(url: string): Promise<ValidationResult> {
    try {
      await axios.get(url, { timeout: TIMEOUT, maxContentLength: MAX_BYTES });
      return { valid: true, message: 'URL is reachable.' };
    } catch (e) {
      return { valid: false, message: `URL not reachable: ${errMessage(e)}` };
    }
  }
}

function errMessage(e: unknown): string {
  if (axios.isAxiosError(e))
    return e.response ? `HTTP ${e.response.status}` : (e.code ?? e.message);
  return e instanceof Error ? e.message : String(e);
}
