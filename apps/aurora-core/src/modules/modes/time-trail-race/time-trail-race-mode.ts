import crypto from 'crypto';
import { injectable } from 'tsyringe';
import Mode from '../mode';
import ScreenChannel from '../../plugins/ports/screen-channel';
import AudioControl from '../../plugins/ports/audio-control';
import BeatSource from '../../plugins/ports/beat-source';
import { TimeTrailRaceState } from '../../events/time-trail-race-state';
import { BackofficeSyncEmitter } from '../../events/backoffice-sync-emitter';
import {
  PlayerParams,
  RegisterPlayerParams,
  ScoreboardItem,
} from '../../events/time-trail-race-entities';
import {
  RaceFinishedEvent,
  RaceInitializedEvent,
  RacePlayerReadyEvent,
  RacePlayerRegisteredEvent,
  RaceScoreboardEvent,
  RaceStartedEvent,
} from '../../events/time-trail-race-events';
import { InvalidStateError } from './time-trail-race-invalid-state-error';

/**
 * The events the time trail race screen view listens for. Owned by this mode, not by Aurora.
 */
export type TimeTrailRaceScreenEvents = {
  'race-initialized': RaceInitializedEvent;
  'race-player-registered': RacePlayerRegisteredEvent;
  'race-player-ready': RacePlayerReadyEvent;
  'race-started': RaceStartedEvent;
  'race-finished': RaceFinishedEvent;
  'race-scoreboard': RaceScoreboardEvent;
};
import TimeTrailRaceLightsHandler from '../../handlers/lights/time-trail-race-lights-handler';
import { SimpleBeatGenerator, BeatPriorities } from '../../beats';
import logger from '../../../logger';
import { SpotifyTrackHandler } from '../../spotify';

const MUSIC_FILE = '/static/audio/benny-hill-theme.mp3';

@injectable()
export default class TimeTrailRaceMode implements Mode {
  private timeTrailBeatGenerator: SimpleBeatGenerator | undefined;

  private backofficeSyncEmitter: BackofficeSyncEmitter;

  private spotify: SpotifyTrackHandler;

  private _sessionName: string;

  private _state: TimeTrailRaceState;

  public playerParams: PlayerParams;

  private startTime: Date | undefined;

  private lastScore: ScoreboardItem | undefined;

  public scoreboard: ScoreboardItem[] = [];

  destroy(): void {
    this.stopBeats();
  }

  constructor(
    private readonly lightsHandler: TimeTrailRaceLightsHandler,
    private readonly audioControl: AudioControl,
    private readonly screenChannel: ScreenChannel<TimeTrailRaceScreenEvents>,
    private readonly beatSource: BeatSource,
  ) {
    this.spotify = SpotifyTrackHandler.getInstance();
  }

  public get state() {
    return this._state;
  }

  public get sessionName() {
    return this._sessionName;
  }

  /**
   * Stop the beat generator if it is enabled.
   */
  private stopBeats(): void {
    if (this.timeTrailBeatGenerator) {
      this.beatSource.remove(this.timeTrailBeatGenerator.getId());
      this.timeTrailBeatGenerator = undefined;
    }
  }

  public initialize(backofficeSyncEmitter: BackofficeSyncEmitter, sessionName: string) {
    this.backofficeSyncEmitter = backofficeSyncEmitter;
    this._sessionName = sessionName;
    this._state = TimeTrailRaceState.INITIALIZED;

    const event: RaceInitializedEvent = {
      state: this._state,
      sessionName,
    };
    this.screenChannel.emit('race-initialized', event);
    this.backofficeSyncEmitter.emit('race-initialize', event);

    this.lightsHandler.setLightsToParty();

    logger.trace(`Time Trail Race initialized (${sessionName})`);

    return event;
  }

  /**
   * Register the player that will participate next in a time trail
   * @param params
   */
  public registerPlayer(params: RegisterPlayerParams) {
    if (
      this._state !== TimeTrailRaceState.INITIALIZED &&
      this._state !== TimeTrailRaceState.SCOREBOARD
    ) {
      throw new InvalidStateError('Time Trail Race not in INITIALIZED or SCOREBOARD state');
    }

    this.playerParams = {
      ...params,
      uuid: crypto.randomUUID(),
    };
    this._state = TimeTrailRaceState.PLAYER_REGISTERED;

    const event: RacePlayerRegisteredEvent = {
      state: this._state,
      sessionName: this._sessionName,
      player: this.playerParams,
      scoreboard: this.scoreboard,
    };
    this.screenChannel.emit('race-player-registered', event);
    this.backofficeSyncEmitter.emit('race-player-registered', event);

    logger.trace(`Time Trail Race player "${params.name}" registered`);

    return event;
  }

  /**
   * Player is ready to start
   */
  public ready() {
    if (this._state !== TimeTrailRaceState.PLAYER_REGISTERED) {
      throw new InvalidStateError('Time Trail Race not in PLAYER_REGISTERED state');
    }

    this._state = TimeTrailRaceState.PLAYER_READY;

    const event: RacePlayerReadyEvent = {
      state: this._state,
      sessionName: this._sessionName,
      player: this.playerParams,
    };
    this.screenChannel.emit('race-player-ready', event);
    this.backofficeSyncEmitter.emit('race-player-ready', event);

    this.lightsHandler.setLightsToWhite();
    this.spotify.pausePlayback();

    logger.trace('Time Trail Race player ready');

    return event;
  }

  /**
   * Player starts the time trail race
   */
  public start() {
    if (this._state !== TimeTrailRaceState.PLAYER_READY) {
      throw new InvalidStateError('Time Trail Race not in PLAYER_READY state');
    }

    this.startTime = new Date();
    this._state = TimeTrailRaceState.STARTED;

    const event: RaceStartedEvent = {
      state: this._state,
      sessionName: this._sessionName,
      startTime: this.startTime,
      player: this.playerParams,
    };
    this.screenChannel.emit('race-started', event);
    this.backofficeSyncEmitter.emit('race-start', event);
    this.audioControl.play(MUSIC_FILE);

    this.lightsHandler.setLightsToParty();
    this.timeTrailBeatGenerator = new SimpleBeatGenerator('time-trail', 'Time Trail Race', 125);
    this.beatSource.add(this.timeTrailBeatGenerator, BeatPriorities.TIME_TRAIL_BEAT_GENERATOR);

    logger.trace(`Time trail race player started at ${this.startTime.toLocaleTimeString()}`);

    return event;
  }

  /**
   * Player finishes the time trail race
   * @returns boolean whether precondition is met and thus moved to new state
   */
  public finish() {
    if (this._state !== TimeTrailRaceState.STARTED || !this.startTime) {
      throw new InvalidStateError('Time Trail Race not in STARTED state');
    }

    const finishTime = new Date().getTime() - this.startTime.getTime();
    this.lastScore = {
      ...this.playerParams,
      timeMs: finishTime,
    };
    this.scoreboard.push(this.lastScore);
    this.scoreboard.sort((a, b) => a.timeMs - b.timeMs);

    this._state = TimeTrailRaceState.FINISHED;

    const event: RaceFinishedEvent = {
      state: this._state,
      sessionName: this._sessionName,
      player: this.lastScore,
      scoreboard: this.scoreboard,
    };
    this.screenChannel.emit('race-finished', event);
    this.backofficeSyncEmitter.emit('race-finish', event);
    this.audioControl.stop();

    this.lightsHandler.setLightsToWhite();
    this.stopBeats();

    logger.trace(`Time Trail Race player finished with ${finishTime.toLocaleString()}ms`);

    return event;
  }

  /**
   * State is reset to scoreboard state and current player is removed
   */
  public resetToStartState() {
    this._state = TimeTrailRaceState.SCOREBOARD;
    const event: RaceScoreboardEvent = {
      state: this._state,
      sessionName: this._sessionName,
      player: this.lastScore,
      scoreboard: this.scoreboard,
    };
    this.screenChannel.emit('race-scoreboard', event);
    this.backofficeSyncEmitter.emit('race-scoreboard', event);
    this.stopBeats();

    this.lightsHandler.setLightsToParty();
    this.spotify.resumePlayback();

    return event;
  }

  /**
   * Player's score is revealed and new player can be registered
   */
  public revealScore() {
    if (this._state !== TimeTrailRaceState.FINISHED || !this.lastScore) {
      throw new InvalidStateError('Time Trail Race not in FINISHED state');
    }

    const event = this.resetToStartState();
    logger.trace('Time Trail Race score revealed');
    return event;
  }
}
