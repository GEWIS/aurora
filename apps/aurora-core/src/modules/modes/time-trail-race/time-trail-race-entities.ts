export interface RegisterPlayerParams {
  name: string;
  alcoholFree: boolean;
  bac: boolean;
}

export interface PlayerParams extends RegisterPlayerParams {
  uuid: string;
}

export interface ScoreboardItem extends PlayerParams {
  /** Finish time (in ms) */
  timeMs: number;
}
