import BaseScreenHandler from '../base-screen-handler';
import { BeatEvent, TrackChangeEvent } from '../../events/music-emitter-events';

export default class CurrentlyPlayingTrackHandler extends BaseScreenHandler {
  beat(event: BeatEvent): void {
    this.sendEvent('beat', event);
  }

  changeTrack(event: TrackChangeEvent[]): void {
    this.sendEvent('change_track', event);
  }
}
