import BaseScreenHandler from '../../base-screen-handler';
import { Namespace } from 'socket.io';
import { FeatureEnabled, ServerSettingsStore } from '../../../server-settings';
import { TrelloPosterManager } from './trello/trello-poster-manager';
import { TrackChangeEvent } from '../../../events/music-emitter-events';
import { PosterManager } from './poster-manager';
import { ISettings } from '../../../server-settings/server-setting';
import { MockPosterManager } from './mock/mock-poster-manager';

@FeatureEnabled('Poster')
export default class CarouselPosterHandler extends BaseScreenHandler {
  public posterManager: PosterManager;

  private borrelModeDay: number | undefined;

  private borrelModeInterval: NodeJS.Timeout | undefined;

  constructor(socket: Namespace) {
    super(socket);

    if (this.borrelModeIsPresent()) {
      // Check whether we need to enable/disable borrel mode
      this.borrelModeInterval = setInterval(this.checkBorrelMode.bind(this), 60 * 1000);
    }
    // Overwrite with mock poster manager if we are in development and the trello board id is set to "mock"
    if (process.env.NODE_ENV === 'development' && process.env.TRELLO_BOARD_ID === 'mock') {
      this.posterManager = new MockPosterManager();
    } else {
      this.posterManager = new TrelloPosterManager();
    }
  }

  forceUpdate(): void {
    this.sendEvent('update_posters');
  }

  // Do nothing
  beat(): void {}

  changeTrack(event: TrackChangeEvent[]): void {
    this.sendEvent('change_track', event);
  }

  public get borrelMode() {
    return this.borrelModeDay !== undefined;
  }

  public borrelModeIsPresent(): boolean {
    const settings = ServerSettingsStore.getInstance();
    return settings.getSetting('Poster.BorrelModePresent') as ISettings['Poster.BorrelModePresent'];
  }

  @FeatureEnabled('Poster.BorrelModePresent')
  private checkBorrelMode() {
    if (!this.borrelModeIsPresent()) return;

    const now = new Date();

    // If borrelmode is enabled, but we arrive at the next day, disable borrelmode again
    if (this.borrelMode && this.borrelModeDay !== now.getDay()) {
      this.borrelModeDay = undefined;
      return;
    }
    // if borrelmode is enabled, we do not have to check whether we can enable it
    if (this.borrelMode) return;

    // By default, enable borrelmode on Thursdays 16:30 local time
    if (
      now.getDay() === 4 &&
      ((now.getHours() === 16 && now.getMinutes() >= 30) || now.getHours() >= 17)
    ) {
      this.borrelModeDay = now.getDay();
    }
  }

  @FeatureEnabled('Poster.BorrelModePresent')
  public setBorrelModeEnabled(enabled: boolean) {
    if (enabled) {
      this.borrelModeDay = new Date().getDay();
    } else {
      this.borrelModeDay = undefined;
    }
  }
}
