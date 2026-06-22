import { Body, Delete, Get, Post, Route, Security, Tags } from 'tsoa';
import { Controller } from '@tsoa/runtime';
import YoutubeScreenHandler, { YoutubeScreenHandlerState } from './youtube-screen-handler';
import HandlerManager from '../../../root/handler-manager';
import { Screen } from '../../../root/entities';
import { SecurityNames } from '../../../../helpers/security';
import { securityGroups } from '../../../../helpers/security-groups';

interface LoadRequest {
  url: string;
}

interface SeekRequest {
  position: number;
}

interface SetOptionsRequest {
  loop?: boolean;
  audio?: boolean;
}

@Route('handler/screen/youtube')
@Tags('Handlers')
export class YoutubeController extends Controller {
  private getHandler(): YoutubeScreenHandler {
    const handler: YoutubeScreenHandler | undefined = HandlerManager.getInstance()
      .getHandlers(Screen)
      .find((h) => h.constructor.name === YoutubeScreenHandler.name) as
      | YoutubeScreenHandler
      | undefined;
    if (!handler) throw new Error('YoutubeScreenHandler not found');
    return handler;
  }

  /**
   * Return the current state of the YouTube screen handler.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('')
  public async getYoutubeScreenHandlerState(): Promise<YoutubeScreenHandlerState> {
    return this.getHandler().getState();
  }

  /**
   * Clears the YouTube screen handler state.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Delete('')
  public async clearYoutubePlayback(): Promise<void> {
    return this.getHandler().reset();
  }

  /**
   * Load YouTube URL and start downloading/transcoding.
   * @param body
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('load')
  public async startYoutubeLoad(@Body() body: LoadRequest): Promise<void> {
    // TODO: implement
  }

  /**
   * Cancel an ongoing load procedure.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('load/cancel')
  public async cancelYoutubeLoad(): Promise<void> {
    // TODO: implement
  }

  /**
   * Start loaded YouTube video.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('play')
  public async startYoutubePlayback(): Promise<void> {
    // TODO: implement
  }

  /**
   * Pause the currently playing YouTube video.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('pause')
  public async pauseYoutubePlayback(): Promise<void> {
    // TODO: implement
  }

  /**
   * Resumes paused YouTube video.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('resume')
  public async resumeYoutubePlayback(): Promise<void> {
    // TODO: implement
  }

  /**
   * Seek to the given position in the YouTube video.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('seek')
  public async seekYoutubePlayback(@Body() body: SeekRequest): Promise<void> {
    // TODO: implement
  }

  /**
   * Toggle the audio and/or looping options of the YouTube playback.
   * @param body
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('options')
  public async setYoutubePlaybackOptions(@Body() body: SetOptionsRequest): Promise<void> {
    // TODO: implement
  }
}
