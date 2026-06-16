import { TimeTrailRaceState } from './time-trail-race-state';

import { PlayerParams, ScoreboardItem } from './time-trail-race-entities';

type RaceBaseEvent = {
  sessionName: string;
};

export type RaceInitializedEvent = RaceBaseEvent & {
  state: TimeTrailRaceState.INITIALIZED;
};

export type RacePlayerRegisteredEvent = RaceBaseEvent & {
  state: TimeTrailRaceState.PLAYER_REGISTERED;
  player: PlayerParams;
  scoreboard: ScoreboardItem[];
};

export type RacePlayerReadyEvent = RaceBaseEvent & {
  state: TimeTrailRaceState.PLAYER_READY;
  player: PlayerParams;
};

export type RaceStartedEvent = RaceBaseEvent & {
  state: TimeTrailRaceState.STARTED;
  player: PlayerParams;
  startTime: Date;
};

export type RaceFinishedEvent = RaceBaseEvent & {
  state: TimeTrailRaceState.FINISHED;
  player: ScoreboardItem;
  scoreboard: ScoreboardItem[];
};

export type RaceScoreboardEvent = RaceBaseEvent & {
  state: TimeTrailRaceState.SCOREBOARD;
  scoreboard: ScoreboardItem[];
  player?: ScoreboardItem;
};
