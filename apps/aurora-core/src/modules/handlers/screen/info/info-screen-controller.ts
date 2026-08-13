import { Body, Delete, Get, Path, Post, Put, Query, Request, Route, Tags } from 'tsoa';
import { Controller } from '@tsoa/runtime';
import { Request as ExpressRequest } from 'express';
import { Security } from '../../../auth';
import { SecurityNames } from '../../../../helpers/security';
import { securityGroups } from '../../../../helpers/security-groups';
import logger from '../../../../logger';
import HandlerManager from '../../../root/handler-manager';
import { Screen } from '../../../root/entities';
import InfoScreenHandler from './info-screen-handler';
import { FeatureEnabled } from '../../../server-settings';
import WeatherService, { WeatherResponse } from './weather-service';
import RainRadarService, { RainRadarResponse } from './rain-radar-service';
import NewsService, {
  NewsHeadline,
  NewsSourceParams,
  NewsSourceResponse,
} from './news-service';
import CalendarService, { AgendaEvent } from './calendar-service';
import NsTrainsService, { TrainResponse } from '../poster/ns-trains-service';
import { applyTreinLimbo } from './trains-transform';
import PcUsageService, {
  PcStatusResponse,
  SetPcOverrideParams,
  SetPcUsageParams,
} from './pc-usage-service';
import InfoStatusService, {
  KeyholderParams,
  KeyholderResponse,
  RoomStatusParams,
  RoomStatusResponse,
} from './info-status-service';
import LayoutService, {
  InfoScreenLayoutResponse,
  SetInfoLayoutParams,
} from './layout-service';
import LayoutPresetService, {
  LayoutPresetParams,
  LayoutPresetResponse,
} from './layout-preset-service';
import CallerService, {
  CallerParams,
  CallerResponse,
  CallerRingParams,
} from './caller-service';
import ServicesHealthService, { ServicesHealthResponse } from './services-health-service';
import ValidationService, { ValidationParams, ValidationResult } from './validation-service';
import ConferenceRoomsService, {
  ConferenceRoomConfigResponse,
  ConferenceRoomParams,
  ConferenceRoomsResponse,
} from './conference-rooms-service';
import { WidgetCatalogItem, enabledCatalog } from './widget-catalog';
import LdapKeyholderSyncService, {
  KeyholderSyncResult,
  KeyholderSyncStatus,
} from './ldap-keyholder-sync-service';
import RootScreenService from '../../../root/root-screen-service';
import { HttpApiException } from '../../../../helpers/custom-error';

@Route('handler/screen/info')
@Tags('Handlers')
@FeatureEnabled('InfoScreen')
export class InfoScreenController extends Controller {
  private infoStatusService = new InfoStatusService();

  private pcUsageService = new PcUsageService();

  private layoutService = new LayoutService();

  private layoutPresetService = new LayoutPresetService();

  private callerService = new CallerService();

  private newsService = new NewsService();

  private validationService = new ValidationService();

  private conferenceRoomsService = new ConferenceRoomsService();

  private servicesHealthService = new ServicesHealthService();

  /**
   * Resolve the running info screen handler so that mutations can push updates
   * to the subscribed screens immediately. May be undefined if the handler is
   * disabled.
   */
  private getHandler(): InfoScreenHandler | undefined {
    return HandlerManager.getInstance()
      .getHandlers(Screen)
      .find((h) => h.constructor.name === InfoScreenHandler.name) as InfoScreenHandler | undefined;
  }

  // ---------------------------------------------------------------------------
  // Ambient widget data
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('weather')
  public async getInfoWeather(
    @Query() lat?: number,
    @Query() lon?: number,
  ): Promise<WeatherResponse> {
    return new WeatherService().getWeather(lat, lon);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('rain-radar')
  public async getInfoRainRadar(
    @Query() lat?: string,
    @Query() lon?: string,
  ): Promise<RainRadarResponse> {
    return new RainRadarService().getForecast(lat, lon);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('trains')
  public async getInfoTrains(@Query() station?: string): Promise<TrainResponse[]> {
    return applyTreinLimbo(await new NsTrainsService().getTrains(station));
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('news')
  public async getInfoNews(): Promise<NewsHeadline[]> {
    return this.newsService.getHeadlines();
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('agenda')
  public async getInfoAgenda(@Query() url?: string): Promise<AgendaEvent[]> {
    return new CalendarService().getTodaysEvents(url);
  }

  // ---------------------------------------------------------------------------
  // PC usage
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('pc-usage')
  public async getInfoPcUsage(
    @Query() includeDisabled?: boolean,
  ): Promise<PcStatusResponse[]> {
    return this.pcUsageService.getAll(includeDisabled ?? false);
  }

  /**
   * Bulk-set the status of all PCs. Intended for a single poster instance that
   * gathers every PC's state and pushes it here with a shared integration key.
   */
  @Security(SecurityNames.INTEGRATION, ['setInfoPcUsage'])
  @Post('pc-usage')
  public async setInfoPcUsage(@Body() body: SetPcUsageParams): Promise<void> {
    await this.pcUsageService.replaceAll(body);
    await this.getHandler()?.emitPcUsage();
  }

  /**
   * Set the backoffice override (maintenance / disabled / none) for a PC. The
   * override takes precedence over reported statuses until cleared.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('pc-usage/{pcId}/override')
  public async setInfoPcOverride(
    @Request() req: ExpressRequest,
    @Path() pcId: string,
    @Body() body: SetPcOverrideParams,
  ): Promise<void> {
    logger.audit(req.user, `Set info screen PC "${pcId}" override to "${body.override}".`);
    const found = await this.pcUsageService.setOverride(pcId, body.override);
    if (!found) {
      this.setStatus(404);
      return;
    }
    await this.getHandler()?.emitPcUsage();
  }

  /**
   * Delete a PC from the list. It reappears on the next status post.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Delete('pc-usage/{pcId}')
  public async deleteInfoPc(@Request() req: ExpressRequest, @Path() pcId: string): Promise<void> {
    logger.audit(req.user, `Delete info screen PC "${pcId}".`);
    const found = await this.pcUsageService.deletePc(pcId);
    if (!found) {
      this.setStatus(404);
      return;
    }
    await this.getHandler()?.emitPcUsage();
  }

  // ---------------------------------------------------------------------------
  // Room status (backoffice managed)
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('room-status')
  public async getInfoRoomStatus(): Promise<RoomStatusResponse> {
    return this.infoStatusService.getRoomStatus();
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('room-status')
  public async setInfoRoomStatus(
    @Request() req: ExpressRequest,
    @Body() body: RoomStatusParams,
  ): Promise<RoomStatusResponse> {
    logger.audit(req.user, 'Update info screen room status.');
    await this.infoStatusService.setRoomStatus(body);
    await this.getHandler()?.emitRoomStatus();
    return this.infoStatusService.getRoomStatus();
  }

  // ---------------------------------------------------------------------------
  // Keyholder registry (backoffice managed)
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('keyholders')
  public async getInfoKeyholders(): Promise<KeyholderResponse[]> {
    const keyholders = await this.infoStatusService.getKeyholders();
    return keyholders.map(InfoStatusService.toKeyholderResponse);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('keyholders')
  public async createInfoKeyholder(
    @Request() req: ExpressRequest,
    @Body() body: KeyholderParams,
  ): Promise<KeyholderResponse> {
    logger.audit(req.user, `Create info screen keyholder "${body.name}".`);
    const keyholder = await this.infoStatusService.createKeyholder(body);
    return InfoStatusService.toKeyholderResponse(keyholder);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('keyholders/{id}')
  public async updateInfoKeyholder(
    id: number,
    @Request() req: ExpressRequest,
    @Body() body: KeyholderParams,
  ): Promise<KeyholderResponse> {
    logger.audit(req.user, `Update info screen keyholder ${id}.`);
    const keyholder = await this.infoStatusService.updateKeyholder(id, body);
    if (!keyholder) {
      this.setStatus(404);
      return undefined as unknown as KeyholderResponse;
    }
    return InfoStatusService.toKeyholderResponse(keyholder);
  }

  /**
   * Restore an LDAP-managed keyholder's name to the directory's own value.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('keyholders/{id}/revert')
  public async revertInfoKeyholder(
    id: number,
    @Request() req: ExpressRequest,
  ): Promise<KeyholderResponse> {
    logger.audit(req.user, `Revert info screen keyholder ${id} to its LDAP state.`);
    const keyholder = await this.infoStatusService.revertKeyholder(id);
    if (keyholder === null) {
      this.setStatus(404);
      return undefined as unknown as KeyholderResponse;
    }
    if (keyholder === undefined) {
      throw new HttpApiException(400, 'This keyholder does not come from LDAP.');
    }
    await this.getHandler()?.emitRoomStatus();
    return InfoStatusService.toKeyholderResponse(keyholder);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Delete('keyholders/{id}')
  public async deleteInfoKeyholder(id: number, @Request() req: ExpressRequest): Promise<void> {
    logger.audit(req.user, `Delete info screen keyholder ${id}.`);
    const result = await this.infoStatusService.deleteKeyholder(id);
    if (result === 'not-found') this.setStatus(404);
    if (result === 'ldap-managed') {
      throw new HttpApiException(
        409,
        'This keyholder comes from LDAP and cannot be deleted; remove them from the group instead.',
      );
    }
  }

  /**
   * Whether an LDAP keyholder sync can be run on this deployment, so the
   * backoffice can explain a disabled sync button.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Get('keyholders/sync')
  public async getInfoKeyholderSyncStatus(): Promise<KeyholderSyncStatus> {
    return LdapKeyholderSyncService.status();
  }

  /**
   * Run the LDAP keyholder sync now, in addition to its periodic run.
   *
   * @param dryRun Report what would change without writing anything.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('keyholders/sync')
  public async syncInfoKeyholders(
    @Request() req: ExpressRequest,
    @Query() dryRun?: boolean,
  ): Promise<KeyholderSyncResult> {
    const service = LdapKeyholderSyncService.fromEnv();
    if (!service) {
      throw new HttpApiException(
        400,
        'LDAP is not configured on this server (see LDAP_URL and LDAP_GROUP_*).',
      );
    }
    logger.audit(req.user, `Sync info screen keyholders from LDAP${dryRun ? ' (dry run)' : ''}.`);

    const result = await service.run(dryRun ?? false);
    if (!result) {
      throw new HttpApiException(
        502,
        'The LDAP sync did not complete and nothing was changed; check the server logs.',
      );
    }

    if (!dryRun) {
      // Keyholders drive the responsible annotations and the PC-usage symbols.
      await this.getHandler()?.emitRoomStatus();
      await this.getHandler()?.emitPcUsage();
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Widget catalog + per-screen layout
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('widget-catalog')
  public async getInfoWidgetCatalog(): Promise<WidgetCatalogItem[]> {
    // Disabled widgets (see DISABLED_WIDGETS) are never offered to the editor.
    return enabledCatalog();
  }

  /**
   * The layout of the authenticated screen itself (used by the client on mount).
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.subscriber)
  @Get('layout')
  public async getInfoOwnLayout(
    @Request() req: ExpressRequest,
  ): Promise<InfoScreenLayoutResponse> {
    const screenId = req.user?.screenId;
    if (!screenId) {
      throw new HttpApiException(400, 'Authenticated user is not a screen subscriber.');
    }
    return this.layoutService.getForScreen(screenId);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Get('layout/{screenId}')
  public async getInfoLayout(@Path() screenId: number): Promise<InfoScreenLayoutResponse> {
    return this.layoutService.getForScreen(screenId);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('layout/{screenId}')
  public async setInfoLayout(
    @Request() req: ExpressRequest,
    @Path() screenId: number,
    @Body() body: SetInfoLayoutParams,
  ): Promise<InfoScreenLayoutResponse> {
    logger.audit(req.user, `Update info screen layout for screen ${screenId}.`);
    const layout = await this.layoutService.save(screenId, body);
    await this.getHandler()?.emitLayout(screenId);
    return layout;
  }

  /**
   * Copy the given screen's layout to every other screen.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('layout/{screenId}/copy-to-all')
  public async copyInfoLayoutToAll(
    @Request() req: ExpressRequest,
    @Path() screenId: number,
  ): Promise<void> {
    logger.audit(req.user, `Copy info screen layout of screen ${screenId} to all screens.`);
    const screens = await new RootScreenService().getAllScreens();
    const screenIds = screens.map((s) => s.id);
    await this.layoutService.copyToAll(screenId, screenIds);
    await Promise.all(screenIds.map((id) => this.getHandler()?.emitLayout(id)));
  }

  // ---------------------------------------------------------------------------
  // Saved layout configurations (presets)
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Get('layout-presets')
  public async getInfoLayoutPresets(): Promise<LayoutPresetResponse[]> {
    const presets = await this.layoutPresetService.getAll();
    return presets.map(LayoutPresetService.toResponse);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('layout-presets')
  public async createInfoLayoutPreset(
    @Request() req: ExpressRequest,
    @Body() body: LayoutPresetParams,
  ): Promise<LayoutPresetResponse> {
    logger.audit(req.user, `Create info screen layout configuration "${body.name}".`);
    const preset = await this.layoutPresetService.create(body);
    return LayoutPresetService.toResponse(preset);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('layout-presets/{id}')
  public async updateInfoLayoutPreset(
    @Path() id: number,
    @Request() req: ExpressRequest,
    @Body() body: LayoutPresetParams,
  ): Promise<LayoutPresetResponse> {
    logger.audit(req.user, `Update info screen layout configuration ${id}.`);
    const preset = await this.layoutPresetService.update(id, body);
    if (!preset) {
      this.setStatus(404);
      return undefined as unknown as LayoutPresetResponse;
    }
    return LayoutPresetService.toResponse(preset);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Delete('layout-presets/{id}')
  public async deleteInfoLayoutPreset(
    @Path() id: number,
    @Request() req: ExpressRequest,
  ): Promise<void> {
    logger.audit(req.user, `Delete info screen layout configuration ${id}.`);
    const deleted = await this.layoutPresetService.delete(id);
    if (!deleted) this.setStatus(404);
  }

  // ---------------------------------------------------------------------------
  // Caller registry + incoming-call trigger
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Get('callers')
  public async getInfoCallers(): Promise<CallerResponse[]> {
    const callers = await this.callerService.getAll();
    return callers.map(CallerService.toResponse);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('callers')
  public async createInfoCaller(
    @Request() req: ExpressRequest,
    @Body() body: CallerParams,
  ): Promise<CallerResponse> {
    logger.audit(req.user, `Create info screen caller "${body.name}".`);
    const caller = await this.callerService.create(body);
    return CallerService.toResponse(caller);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('callers/{id}')
  public async updateInfoCaller(
    @Path() id: number,
    @Request() req: ExpressRequest,
    @Body() body: CallerParams,
  ): Promise<CallerResponse> {
    logger.audit(req.user, `Update info screen caller ${id}.`);
    const caller = await this.callerService.update(id, body);
    if (!caller) {
      this.setStatus(404);
      return undefined as unknown as CallerResponse;
    }
    return CallerService.toResponse(caller);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Delete('callers/{id}')
  public async deleteInfoCaller(
    @Path() id: number,
    @Request() req: ExpressRequest,
  ): Promise<void> {
    logger.audit(req.user, `Delete info screen caller ${id}.`);
    const deleted = await this.callerService.delete(id);
    if (!deleted) this.setStatus(404);
  }

  /**
   * Report an incoming call. Intended for the phone system to hit with a shared
   * integration key; resolves the number against the directory and shows the
   * incoming-call overlay on the screens.
   */
  @Security(SecurityNames.INTEGRATION, ['setInfoCallerRing'])
  @Post('caller-ring')
  public async setInfoCallerRing(@Body() body: CallerRingParams): Promise<void> {
    const event = await this.callerService.resolve(body.number);
    this.getHandler()?.emitCaller(event);
  }

  /**
   * Trigger a test incoming-call overlay from the backoffice (same behaviour as
   * the integration endpoint, but human-authenticated).
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('caller-ring/test')
  public async testInfoCallerRing(
    @Request() req: ExpressRequest,
    @Body() body: CallerRingParams,
  ): Promise<void> {
    logger.audit(req.user, `Trigger test info screen call for "${body.number}".`);
    const event = await this.callerService.resolve(body.number);
    this.getHandler()?.emitCaller(event);
  }

  // ---------------------------------------------------------------------------
  // Services health (Uptime Kuma) + conference rooms (stub)
  // ---------------------------------------------------------------------------

  /**
   * @param url Uptime Kuma or Gatus URL; defaults to STATUS_PAGE_URL.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('services')
  public async getInfoServices(@Query() url?: string): Promise<ServicesHealthResponse> {
    return this.servicesHealthService.getHealth(url);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.base)
  @Get('conference-rooms')
  public async getInfoConferenceRooms(): Promise<ConferenceRoomsResponse> {
    return this.conferenceRoomsService.getRooms();
  }

  // ---------------------------------------------------------------------------
  // Conference room registry (backoffice managed)
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Get('conference-room-configs')
  public async getInfoConferenceRoomConfigs(): Promise<ConferenceRoomConfigResponse[]> {
    const rooms = await this.conferenceRoomsService.getConfigs();
    return rooms.map(ConferenceRoomsService.toConfigResponse);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('conference-room-configs')
  public async createInfoConferenceRoom(
    @Request() req: ExpressRequest,
    @Body() body: ConferenceRoomParams,
  ): Promise<ConferenceRoomConfigResponse> {
    logger.audit(req.user, `Create info screen conference room "${body.number}".`);
    const room = await this.conferenceRoomsService.create(body);
    await this.getHandler()?.emitConferenceRooms();
    return ConferenceRoomsService.toConfigResponse(room);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('conference-room-configs/{id}')
  public async updateInfoConferenceRoom(
    @Path() id: number,
    @Request() req: ExpressRequest,
    @Body() body: ConferenceRoomParams,
  ): Promise<ConferenceRoomConfigResponse> {
    logger.audit(req.user, `Update info screen conference room ${id}.`);
    const room = await this.conferenceRoomsService.update(id, body);
    if (!room) {
      this.setStatus(404);
      return undefined as unknown as ConferenceRoomConfigResponse;
    }
    await this.getHandler()?.emitConferenceRooms();
    return ConferenceRoomsService.toConfigResponse(room);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Delete('conference-room-configs/{id}')
  public async deleteInfoConferenceRoom(
    @Path() id: number,
    @Request() req: ExpressRequest,
  ): Promise<void> {
    logger.audit(req.user, `Delete info screen conference room ${id}.`);
    const deleted = await this.conferenceRoomsService.delete(id);
    if (!deleted) {
      this.setStatus(404);
      return;
    }
    await this.getHandler()?.emitConferenceRooms();
  }

  // ---------------------------------------------------------------------------
  // News source registry (backoffice managed)
  // ---------------------------------------------------------------------------

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Get('news-sources')
  public async getInfoNewsSources(): Promise<NewsSourceResponse[]> {
    const sources = await this.newsService.getSources();
    return sources.map(NewsService.toSourceResponse);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('news-sources')
  public async createInfoNewsSource(
    @Request() req: ExpressRequest,
    @Body() body: NewsSourceParams,
  ): Promise<NewsSourceResponse> {
    logger.audit(req.user, `Create info screen news source "${body.name}".`);
    const source = await this.newsService.create(body);
    await this.getHandler()?.emitNews();
    return NewsService.toSourceResponse(source);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Put('news-sources/{id}')
  public async updateInfoNewsSource(
    @Path() id: number,
    @Request() req: ExpressRequest,
    @Body() body: NewsSourceParams,
  ): Promise<NewsSourceResponse> {
    logger.audit(req.user, `Update info screen news source ${id}.`);
    const source = await this.newsService.update(id, body);
    if (!source) {
      this.setStatus(404);
      return undefined as unknown as NewsSourceResponse;
    }
    await this.getHandler()?.emitNews();
    return NewsService.toSourceResponse(source);
  }

  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Delete('news-sources/{id}')
  public async deleteInfoNewsSource(
    @Path() id: number,
    @Request() req: ExpressRequest,
  ): Promise<void> {
    logger.audit(req.user, `Delete info screen news source ${id}.`);
    const deleted = await this.newsService.delete(id);
    if (!deleted) {
      this.setStatus(404);
      return;
    }
    await this.getHandler()?.emitNews();
  }

  // ---------------------------------------------------------------------------
  // Field validation ("test" buttons)
  // ---------------------------------------------------------------------------

  /**
   * Check whether a widget/entity field value actually works (iCal/RSS feed
   * reachable + parseable, NS station code valid, image URL reachable, …) before
   * it is saved to a live screen.
   */
  @Security(SecurityNames.LOCAL, securityGroups.infoscreen.privileged)
  @Post('validate')
  public async validateInfoValue(@Body() body: ValidationParams): Promise<ValidationResult> {
    return this.validationService.validate(body);
  }
}
