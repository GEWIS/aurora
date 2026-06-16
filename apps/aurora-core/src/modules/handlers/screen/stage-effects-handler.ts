import { TrackChangeEvent, BeatEvent } from 'src/modules/events/music-emitter-events';
import BaseScreenHandler from '../base-screen-handler';

export default class StageEffectsHandler extends BaseScreenHandler {
  changeTrack(event: TrackChangeEvent[]): void {
    this.sendEvent('change_track', event);
  }

  beat(event: BeatEvent): void {
    this.sendEvent('beat', event);
  }
}
