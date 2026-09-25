import { Body, Controller, Get, Post, Res, Route, Security, Tags, Request } from 'tsoa';
import { injectable } from 'inversify';
import { type TsoaResponse } from '@tsoa/runtime';
import { type Request as ExpressRequest } from 'express';
import RootAudioService, { type AudioCreateParams, type AudioResponse } from './root-audio-service';
import { SecurityNames } from '../../helpers/security';
import HandlerManager from './handler-manager';
import { Audio } from './entities';
import logger from '../../logger';
import { securityGroups } from '../../helpers/security-groups';

interface SetAudioPlayingParams {
  playing: boolean;
}

@injectable()
@Route('audio')
@Tags('Audios')
export class RootAudioController extends Controller {
  constructor(private readonly handlerManager: HandlerManager) {
    super();
  }

  @Security(SecurityNames.LOCAL, securityGroups.audio.base)
  @Get()
  public async getAudios(): Promise<AudioResponse[]> {
    const audios = await new RootAudioService().getAllAudios();
    return audios.map((a) => RootAudioService.toAudioResponse(a));
  }

  @Security(SecurityNames.LOCAL, securityGroups.audio.privileged)
  @Post()
  public async createAudio(@Body() params: AudioCreateParams): Promise<AudioResponse> {
    const audio = await new RootAudioService().createAudio(params);
    return RootAudioService.toAudioResponse(audio);
  }

  @Security(SecurityNames.LOCAL, securityGroups.audio.subscriber)
  @Post('{id}/playing')
  public async setAudioPlaying(
    id: number,
    @Request() req: ExpressRequest,
    @Body() params: SetAudioPlayingParams,
    @Res() forbiddenResponse: TsoaResponse<403, string>,
  ): Promise<void> {
    if (req.user!.audioId !== id) {
      forbiddenResponse(403, 'You can only set the playing state of yourself.');
      return;
    }

    logger.debug(`Update playing state for audio ${id}: ${JSON.stringify(params)}`);

    const audioHandlers = this.handlerManager.getHandlers(Audio);
    audioHandlers.forEach((h) =>
      (h.entities as Audio[]).forEach((audio: Audio) => {
        if (audio.id === id) {
          // eslint-disable-next-line no-param-reassign
          audio.playing = params.playing;
        }
      }),
    );
  }
}
