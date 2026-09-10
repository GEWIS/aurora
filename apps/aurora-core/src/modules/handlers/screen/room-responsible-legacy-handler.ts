import BaseScreenHandler from '../../root/base-screen-handler';
import { BeatEvent, TrackChangeEvent } from '../../events/music-emitter-events';
import { FeatureEnabled } from '../../server-settings';

@FeatureEnabled('RoomResponsibleLegacyScreenURL')
export default class RoomResponsibleLegacyHandler extends BaseScreenHandler {
  beat(event: BeatEvent): void {}

  changeTrack(event: TrackChangeEvent[]): void {}
}
