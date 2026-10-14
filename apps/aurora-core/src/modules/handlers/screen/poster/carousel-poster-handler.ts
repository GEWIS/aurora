import BaseScreenHandler from '../../../root/base-screen-handler';
import { Namespace } from 'socket.io';
import { FeatureEnabled } from '../../../server-settings';
import { TrackChangeEvent } from '../../../events/music-emitter-events';
import BorrelModeManager from '../../../borrel-mode/borrel-mode-manager';
import PosterService from './local/poster-service';

@FeatureEnabled('Poster')
export default class CarouselPosterHandler extends BaseScreenHandler {
  public posterService: PosterService;

  constructor(socket: Namespace) {
    super(socket);

    // Borrel posters enter or leave the rotation, so screens should reload right away
    BorrelModeManager.getInstance().onChange(() => this.forceUpdate());
    this.posterService = new PosterService();
  }

  forceUpdate(): void {
    this.sendEvent('update_posters');
  }

  // Do nothing
  beat(): void {}

  changeTrack(event: TrackChangeEvent[]): void {
    this.sendEvent('change_track', event);
  }
}
