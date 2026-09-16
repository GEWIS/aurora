import BaseScreenHandler from '../../root/base-screen-handler';
import { BeatEvent, TrackChangeEvent } from '../../events/music-emitter-events';
import { FeatureEnabled } from '../../server-settings';

/**
 * Screens driven by Centurion.
 *
 * Centurion sends its own events through the `ScreenChannel` this provides, so those names
 * and payloads live in `CenturionScreenEvents` rather than here. Beats and track changes
 * come from the host rather than from the mode, so they are forwarded here.
 */
@FeatureEnabled('Centurion')
export default class CenturionScreenHandler extends BaseScreenHandler {
  beat(event: BeatEvent): void {
    this.sendEvent('beat', event);
  }

  changeTrack(event: TrackChangeEvent[]): void {
    this.sendEvent('change_track', event);
  }
}
