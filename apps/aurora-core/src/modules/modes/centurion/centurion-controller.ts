import { Body, Get, Post, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { Controller } from '@tsoa/runtime';
import { Request as ExpressRequest } from 'express';
import ModeManager from '../mode-manager';
import CenturionMode from './centurion-mode';
import { SecurityNames } from '../../../helpers/security';
import MixTape, { HornData, SongData } from './tapes/mix-tape';
import tapes from './tapes';
import ModeDisabledError from '../mode-disabled-error';
import logger from '../../../logger';
import { FeatureEnabled } from '../../server-settings';
import { RgbColor } from '../../lights/color-definitions';
import { securityGroups } from '../../../helpers/security-groups';

interface SkipCenturionRequest {
  /**
   * @minimum 0 Timestamp should be positive
   */
  seconds: number;
}

interface CenturionResponse {
  name: string;
  startTime: Date;
  playing: boolean;
}

interface CenturionStateResponse {
  tape?: Pick<MixTape, 'name' | 'artist' | 'coverUrl'>;
  lastHorn?: HornEvent;
  lastSong?: SongEvent;
  colors?: RgbColor[];
  playing: boolean;
}

interface HornEvent {
  type: 'horn';
  timestamp: number;
  data: HornData;
}

interface SongEvent {
  type: 'song';
  timestamp: number;
  data: SongData | SongData[];
}

interface MixTapeResponse extends Pick<MixTape, 'name' | 'artist' | 'coverUrl'> {
  events: (HornEvent | SongEvent)[];
  /** Amount of horns */
  horns: number;
  /** Duration of the mix tape */
  duration: number;
}

@Route('modes/centurion')
@Tags('Modes')
@FeatureEnabled('Centurion')
export class CenturionController extends Controller {
  private modeManager: ModeManager;

  constructor() {
    super();
    this.modeManager = ModeManager.getInstance();
  }

  @Security(SecurityNames.LOCAL, securityGroups.centurion.base)
  @Get('')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public getCenturion(): CenturionResponse | null {
    const mode = this.modeManager.getMode(CenturionMode) as CenturionMode;
    if (mode === undefined) {
      this.setStatus(204);
      return null;
    }

    return {
      name: mode.tape.name,
      startTime: mode.startTime,
      playing: mode.playing,
    };
  }

  @Security(SecurityNames.LOCAL, securityGroups.centurion.base)
  @Get('state')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public getCenturionState(): CenturionStateResponse {
    const mode = this.modeManager.getMode(CenturionMode) as CenturionMode;
    if (mode === undefined) {
      return { playing: false };
    }

    return {
      tape: { name: mode.tape.name, artist: mode.tape.artist, coverUrl: mode.tape.coverUrl },
      lastHorn: mode.lastHornEvent,
      lastSong: mode.lastSongEvent,
      colors: mode.currentColors,
      playing: mode.playing,
    };
  }

  /**
   * Start a centurion
   */
  @Security(SecurityNames.LOCAL, securityGroups.centurion.privileged)
  @Post('start')
  @SuccessResponse(204, 'Start commands sent')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  @Response<string>(428, 'Centurion not yet fully initialized. Please wait and try again later')
  @Response<ModeDisabledError>(404, 'Centurion not enabled')
  public startCenturion(@Request() req: ExpressRequest) {
    const mode = this.modeManager.getMode(CenturionMode) as CenturionMode;
    if (mode === undefined) {
      throw new ModeDisabledError('Centurion not enabled');
    }

    logger.audit(req.user, 'Start Centurion.');

    if (!mode.start()) {
      this.setStatus(428);
      return 'Centurion not yet fully initialized. Please wait and try again later';
    }

    this.setStatus(204);
    return '';
  }

  @Security(SecurityNames.LOCAL, securityGroups.centurion.privileged)
  @Post('skip')
  @SuccessResponse(204, 'Skip commands sent')
  @Response<string>(400, 'Invalid timestamp provided')
  @Response<ModeDisabledError>(404, 'Centurion not enabled')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public skipCenturion(@Request() req: ExpressRequest, @Body() body: SkipCenturionRequest) {
    const mode = this.modeManager.getMode(CenturionMode) as CenturionMode;
    if (mode === undefined) {
      throw new ModeDisabledError('Centurion not enabled');
    }

    logger.audit(req.user, `Skip Centurion to "${body.seconds}" seconds.`);

    mode.skip(body.seconds);

    this.setStatus(204);
    return '';
  }

  /**
   * Stop a centurion
   */
  @Security(SecurityNames.LOCAL, securityGroups.centurion.privileged)
  @Post('stop')
  @SuccessResponse(204, 'Start commands sent')
  @Response<ModeDisabledError>(404, 'Centurion not enabled')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public stopCenturion(@Request() req: ExpressRequest) {
    const mode = this.modeManager.getMode(CenturionMode) as CenturionMode;
    if (mode === undefined) {
      throw new ModeDisabledError('Centurion not enabled');
    }

    logger.audit(req.user, 'Stop Centurion.');

    mode.stop();
    this.setStatus(204);
    return '';
  }

  @Security(SecurityNames.LOCAL, securityGroups.centurion.base)
  @Get('tapes')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public getCenturionTapes(): MixTapeResponse[] {
    return tapes.map((t) => ({
      name: t.name,
      artist: t.artist,
      coverUrl: t.coverUrl,
      events: t.feed
        .filter((e) => ['horn', 'song'].includes(e.type))
        .map((e) => e as HornEvent | SongEvent),
      horns: t.feed.filter((e) => e.type === 'horn').length,
      duration: t.duration,
    }));
  }
}
