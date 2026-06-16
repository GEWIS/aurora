import BaseScreenHandler from '../base-screen-handler';
import {
  RaceFinishedEvent,
  RaceInitializedEvent,
  RacePlayerReadyEvent,
  RacePlayerRegisteredEvent,
  RaceScoreboardEvent,
  RaceStartedEvent,
} from '../../modes/time-trail-race/time-trail-race-events';
import { FeatureEnabled } from '../../server-settings';

@FeatureEnabled('TimeTrailRace')
export default class TimeTrailRaceScreenHandler extends BaseScreenHandler {
  changeTrack(): void {}

  beat(): void {}

  initialized(params: RaceInitializedEvent): void {
    this.sendEvent('race-initialized', params);
  }

  playerRegistered(params: RacePlayerRegisteredEvent): void {
    this.sendEvent('race-player-registered', params);
  }

  playerReady(params: RacePlayerReadyEvent): void {
    this.sendEvent('race-player-ready', params);
  }

  started(params: RaceStartedEvent): void {
    this.sendEvent('race-started', params);
  }

  finished(params: RaceFinishedEvent): void {
    this.sendEvent('race-finished', params);
  }

  showScoreboard(params: RaceScoreboardEvent): void {
    this.sendEvent('race-scoreboard', params);
  }
}
