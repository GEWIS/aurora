import BaseScreenHandler from '../../root/base-screen-handler';
import { FeatureEnabled } from '../../server-settings';

/**
 * Screens driven by time trail racing.
 *
 * The mode sends its own events through the `ScreenChannel` this provides, so the event
 * names and payloads live in `TimeTrailRaceScreenEvents` rather than here. Beats and track
 * changes are ignored: the race does not follow the music.
 */
@FeatureEnabled('TimeTrailRace')
export default class TimeTrailRaceScreenHandler extends BaseScreenHandler {
  changeTrack(): void {}

  beat(): void {}
}
