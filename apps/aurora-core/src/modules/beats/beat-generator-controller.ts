import { Controller } from '@tsoa/runtime';
import { injectable } from 'tsyringe';
import { Body, Delete, Get, Post, Request, Route, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { SimpleBeatGenerator, ArtificialBeatGeneratorParams } from './simple-beat-generator';
import { SecurityNames } from '../../helpers/security';
import logger from '../../logger';
import { securityGroups } from '../../helpers/security-groups';
import { Security } from '../auth';
import BeatManager, { BeatGeneratorResponse } from './beat-manager';
import BeatPriorities from './beat-priorities';

const ARTIFICIAL_BEAT_GENERATOR_ID = 'artificial';
const ARTIFICIAL_BEAT_GENERATOR_NAME = 'Artificial Beat Generator';
const REAL_TIME_BEAT_GENERATOR_ID = 'realtime';
const REAL_TIME_BEAT_GENERATOR_NAME = 'Real Time Beat Detector';

@Tags('Beat Generator')
@injectable()
@Route('beat-generator')
export class BeatGeneratorController extends Controller {
  constructor(private readonly beatManager: BeatManager) {
    super();
  }

  @Get('')
  @Security(SecurityNames.LOCAL, securityGroups.beats.privileged)
  public getAllBeatGenerators(): BeatGeneratorResponse[] {
    const generators = this.beatManager.getAll();
    return generators.map((g) => this.beatManager.asResponse(g));
  }

  /**
   * Set the BPM found by the real time beat detector
   * @param params
   */
  @Post('real-time')
  @Security(SecurityNames.INTEGRATION, ['setRealTimeBeatDetector'])
  public setRealTimeBeatDetector(@Body() params: ArtificialBeatGeneratorParams) {
    const generator = this.beatManager.get(REAL_TIME_BEAT_GENERATOR_ID);
    if (generator) {
      (generator as SimpleBeatGenerator).setBpm(params.bpm);
    } else {
      this.beatManager.add(
        new SimpleBeatGenerator(
          REAL_TIME_BEAT_GENERATOR_ID,
          REAL_TIME_BEAT_GENERATOR_NAME,
          params.bpm,
        ),
        BeatPriorities.REAL_TIME_BEAT_DETECTOR,
      );
    }
  }

  /**
   * Stop the beats provided by the real time beat detector
   */
  @Delete('real-time')
  @Security(SecurityNames.INTEGRATION, ['stopRealTimeBeatDetector'])
  public stopRealTimeBeatDetector() {
    const generator = this.beatManager.get(REAL_TIME_BEAT_GENERATOR_ID);
    if (generator) {
      this.beatManager.remove(generator.getId());
    }
  }

  @Security(SecurityNames.LOCAL, securityGroups.beats.base)
  @Security(SecurityNames.INTEGRATION, ['getArtificialBeatGenerator'])
  @Get('artificial')
  public getArtificialBeatGenerator(): ArtificialBeatGeneratorParams | null {
    const generator = this.beatManager.get(ARTIFICIAL_BEAT_GENERATOR_ID);
    if (!generator) return null;
    return {
      bpm: (generator as SimpleBeatGenerator).bpm,
    };
  }

  @Security(SecurityNames.LOCAL, securityGroups.beats.base)
  @Security(SecurityNames.INTEGRATION, ['startArtificialBeatGenerator'])
  @Post('artificial')
  public startArtificialBeatGenerator(
    @Request() req: ExpressRequest,
    @Body() params: ArtificialBeatGeneratorParams,
  ) {
    logger.audit(req.user, `Set Artificial Beat Generator BPM to "${params.bpm}".`);

    const generator = this.beatManager.get(ARTIFICIAL_BEAT_GENERATOR_ID);
    if (generator) {
      this.beatManager.remove(generator.getId());
    }
    this.beatManager.add(
      new SimpleBeatGenerator(
        ARTIFICIAL_BEAT_GENERATOR_ID,
        ARTIFICIAL_BEAT_GENERATOR_NAME,
        params.bpm,
      ),
      BeatPriorities.CUSTOM_BEAT_GENERATOR,
    );
  }

  @Security(SecurityNames.LOCAL, securityGroups.beats.base)
  @Security(SecurityNames.INTEGRATION, ['stopArtificialBeatGenerator'])
  @Delete('artificial')
  public stopArtificialBeatGenerator(@Request() req: ExpressRequest) {
    logger.audit(req.user, 'Stop Artificial Beat Generator.');

    const generator = this.beatManager.get(ARTIFICIAL_BEAT_GENERATOR_ID);
    if (!generator) {
      this.setStatus(404);
      return;
    }
    this.beatManager.remove(generator.getId());
  }
}
