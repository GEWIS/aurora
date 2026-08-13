import { Namespace } from 'socket.io';
import BaseScreenHandler from '../../base-screen-handler';
import { BeatEvent, TrackChangeEvent } from '../../../events/music-emitter-events';
import { FeatureEnabled } from '../../../server-settings';
import logger from '../../../../logger';
import WeatherService from './weather-service';
import RainRadarService from './rain-radar-service';
import NewsService from './news-service';
import CalendarService from './calendar-service';
import PcUsageService from './pc-usage-service';
import InfoStatusService from './info-status-service';
import ServicesHealthService from './services-health-service';
import ConferenceRoomsService from './conference-rooms-service';
import LayoutService from './layout-service';
import { CallerRingEvent } from './caller-service';
import NsTrainsService from '../poster/ns-trains-service';
import { applyTreinLimbo } from './trains-transform';
import { isWidgetEnabled } from './widget-catalog';

const SECOND = 1000;

/**
 * Screen handler that drives the modern info screen. It periodically polls a
 * set of data sources and pushes each widget's state to the subscribed screens
 * over the /screen namespace. Room status and PC usage are additionally pushed
 * immediately (by the controller) whenever they change.
 */
@FeatureEnabled('InfoScreen')
export default class InfoScreenHandler extends BaseScreenHandler {
  private readonly weatherService = new WeatherService();

  private readonly rainRadarService = new RainRadarService();

  private readonly newsService = new NewsService();

  private readonly calendarService = new CalendarService();

  private readonly trainsService = new NsTrainsService();

  private readonly pcUsageService = new PcUsageService();

  private readonly infoStatusService = new InfoStatusService();

  private readonly servicesHealthService = new ServicesHealthService();

  private readonly conferenceRoomsService = new ConferenceRoomsService();

  private readonly layoutService = new LayoutService();

  private intervals: NodeJS.Timeout[] = [];

  /** Last logged failure message per event, to avoid spamming identical errors. */
  private readonly lastPollError = new Map<string, string | null>();

  constructor(socket: Namespace) {
    super(socket);

    this.poll('info_weather', 60 * SECOND, () => this.weatherService.getWeather());
    this.poll('info_rainradar', 60 * SECOND, () => this.rainRadarService.getForecast());
    this.poll('info_news', 10 * 60 * SECOND, () => this.newsService.getHeadlines());
    this.poll('info_agenda', 60 * SECOND, () => this.calendarService.getTodaysEvents());
    this.poll('info_trains', 30 * SECOND, async () =>
      applyTreinLimbo(await this.trainsService.getTrains()),
    );
    // Re-emit PC usage on a timer as well so stale PCs flip to OFFLINE even
    // without a new report from the poster instance.
    this.poll('info_pcusage', 60 * SECOND, () => this.pcUsageService.getAll());
    // Re-emit room status on a timer so the daily beer-time reset reaches the
    // screen without a backoffice change.
    this.poll('info_roomstatus', 60 * SECOND, () => this.infoStatusService.getRoomStatus());
    // The deployment-wide status page (env var, else the GEWIS default); widgets
    // carrying their own URL fetch it themselves.
    this.poll('info_services', 60 * SECOND, () => this.servicesHealthService.getHealth());
    // Only polled while the conference-rooms widget is enabled in the catalog;
    // no screen can be showing it otherwise.
    if (isWidgetEnabled('conference-rooms')) {
      this.poll('info_conferencerooms', 60 * SECOND, () => this.conferenceRoomsService.getRooms());
    }
  }

  /**
   * Register a poller that fetches data and broadcasts it under the given event
   * name. Skips fetching entirely when no screen is subscribed.
   */
  private poll<T>(event: string, intervalMs: number, fetcher: () => Promise<T>): void {
    const run = async () => {
      if (this.entities.length === 0) return;
      try {
        const data = await fetcher();
        this.sendEvent(event, data);
        // Recovered after a previous failure.
        if (this.lastPollError.get(event)) {
          logger.info(`InfoScreen "${event}" recovered.`);
          this.lastPollError.set(event, null);
        }
      } catch (e) {
        // External data sources may be transiently unreachable (DNS, timeouts).
        // Log the first occurrence at WARN and suppress identical repeats so the
        // logs are not flooded every poll interval.
        const message = String(e);
        if (this.lastPollError.get(event) !== message) {
          logger.warn(`InfoScreen "${event}" update failed (will retry): ${message}`);
          this.lastPollError.set(event, message);
        }
      }
    };
    run().catch((e) => logger.error(e));
    this.intervals.push(setInterval(() => run().catch((e) => logger.error(e)), intervalMs));
  }

  /**
   * Push the current PC usage to all screens. Called by the controller after a
   * bulk update from the poster instance.
   */
  public async emitPcUsage(): Promise<void> {
    const data = await this.pcUsageService.getAll();
    this.sendEvent('info_pcusage', data);
  }

  /**
   * Push the current room status to all screens. Called by the controller after
   * a backoffice change.
   */
  public async emitRoomStatus(): Promise<void> {
    const data = await this.infoStatusService.getRoomStatus();
    this.sendEvent('info_roomstatus', data);
  }

  /**
   * Push the layout to the single screen it belongs to. Called by the controller
   * after a backoffice layout change.
   */
  public async emitLayout(screenId: number): Promise<void> {
    const screen = this.entities.find((s) => s.id === screenId);
    if (!screen) return;
    const data = await this.layoutService.getForScreen(screenId);
    this.sendEventToScreen(screen, 'info_layout', data);
  }

  /**
   * Push an incoming-call event to all screens (the phone rings for the room,
   * not a specific screen). No-op while the caller widgets are disabled.
   */
  public emitCaller(event: CallerRingEvent): void {
    if (!isWidgetEnabled('caller') && !isWidgetEnabled('caller-inline')) return;
    this.sendEvent('info_caller', event);
  }

  /** Push conference-room availability to all screens (after a backoffice change). */
  public async emitConferenceRooms(): Promise<void> {
    if (!isWidgetEnabled('conference-rooms')) return;
    const data = await this.conferenceRoomsService.getRooms();
    this.sendEvent('info_conferencerooms', data);
  }

  /** Push refreshed news headlines to all screens (after a source change). */
  public async emitNews(): Promise<void> {
    const data = await this.newsService.getHeadlines();
    this.sendEvent('info_news', data);
  }

  // The info screen does not react to beats.
  beat(event: BeatEvent): void {}

  changeTrack(event: TrackChangeEvent[]): void {
    this.sendEvent('change_track', event);
  }

  public reset(): void {
    super.reset();
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }
}
