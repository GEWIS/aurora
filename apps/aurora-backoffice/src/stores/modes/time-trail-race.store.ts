import { defineStore } from 'pinia';
import {
  disableTimeTrailRacing,
  enableTimeTrailRace,
  getRaceState,
  type PlayerParams,
  raceFinish,
  type RaceFinishedEvent,
  type RacePlayerReadyEvent,
  type RacePlayerRegisteredEvent,
  raceReady,
  raceRegisterPlayer,
  raceResetPlayer,
  raceRevealScore,
  type RaceScoreboardEvent,
  raceStart,
  type RaceStartedEvent,
  type RegisterPlayerParams,
  type ScoreboardItem,
  TimeTrailRaceState,
} from '@/api';
import { useSocketStore } from '@/stores/socket.store';

/**
 * Time trail store
 * @param sessionName - The name of the session
 * @param state - The current state of the session
 * @param scoreboard - The scoreboard associated with  the session
 * @param currentPlayer - The current active player
 * @param loading - Whether the store is loading
 * @param startTime - The start time of the session
 */
interface TimeTrailRaceStore {
  sessionName?: string;
  state?: TimeTrailRaceState;
  scoreboard: ScoreboardItem[];
  currentPlayer?: PlayerParams | ScoreboardItem;
  loading: boolean;
  startTime?: Date;
}

export const useTimeTrailRaceStore = defineStore('time-trail-race', {
  state: (): TimeTrailRaceStore => ({
    scoreboard: [],
    loading: true,
  }),
  getters: {
    enabled(): boolean {
      return this.sessionName != null && this.state != null && !this.loading;
    },
    disabled(): boolean {
      return (this.sessionName == null || this.state == null) && !this.loading;
    },
    getSessionName: (state) => state.sessionName,
    getState: (state) => state.state,
    getScoreboard: (state) => state.scoreboard,
    getCurrentPlayer: (state) => state.currentPlayer,
    getLoading: (state) => state.loading,
    getStartTime: (state) => state.startTime,
  },
  actions: {
    /**
     * Get data of current initialized session
     */
    async getTimeTrailMode() {
      this.loading = true;
      try {
        const res = await getRaceState();
        this.state = res.data!.state;
        this.sessionName = res.data!.sessionName;
        this.scoreboard = res.data!.scoreboard;
      } catch {
        this.state = undefined;
        this.sessionName = undefined;
        this.scoreboard = [];
      }
      this.loading = false;
    },
    /**
     * Initialize a new time trail race session
     * @param sessionName - The name of the session
     * @param audioIds - The audio ids to use
     * @param screenIds - The screen ids to use
     * @param lightsGroupIds - The lights group ids to use
     */
    async initializeTimeTrailMode(
      sessionName: string,
      audioIds: number[],
      screenIds: number[],
      lightsGroupIds: number[],
    ) {
      this.loading = true;

      await enableTimeTrailRace({
        body: {
          lightsGroupIds: lightsGroupIds,
          screenIds: screenIds,
          audioIds: audioIds,
          sessionName: sessionName,
        },
      }).then(() => {
        this.sessionName = sessionName;
        this.state = TimeTrailRaceState.INITIALIZED;
      });

      this.loading = false;
    },
    /**
     * Register a player for the current session
     * @param params - The player parameters
     */
    async registerPlayer(params: RegisterPlayerParams) {
      this.loading = true;
      const register = await raceRegisterPlayer({
        body: params,
      });
      this.handleRegisterPlayer(register.data!);
      this.loading = false;
    },
    /**
     * Handle a player being registered and update the store
     * @param event - The event data
     */
    handleRegisterPlayer(event: RacePlayerRegisteredEvent) {
      this.currentPlayer = event.player;
      this.scoreboard = event.scoreboard;
      this.state = event.state as unknown as TimeTrailRaceState;
      this.sessionName = event.sessionName;
    },
    /**
     * Mark the current player as ready
     */
    async ready() {
      this.loading = true;
      const ready = await raceReady();
      this.handleReady(ready.data!);
      this.loading = false;
    },
    /**
     * Handle a player being marked as ready and update the store
     * @param event - The event data
     */
    handleReady(event: RacePlayerReadyEvent) {
      this.currentPlayer = event.player;
      this.state = event.state as unknown as TimeTrailRaceState;
      this.sessionName = event.sessionName;
    },
    /**
     * Start the current session
     */
    async start() {
      this.loading = true;
      const start = await raceStart();
      this.handleStart(start.data!);
      this.loading = false;
    },
    /**
     * Handle a session being started and update the store
     * @param event - The event data
     */
    handleStart(event: RaceStartedEvent) {
      this.currentPlayer = event.player;
      this.state = event.state as unknown as TimeTrailRaceState;
      this.sessionName = event.sessionName;
      this.startTime = new Date(event.startTime);
    },
    /**
     * Finish the current session
     */
    async finish() {
      this.loading = true;
      const finish = await raceFinish();
      this.handleFinish(finish.data!);
      this.loading = false;
    },
    /**
     * Handle a session being finished and update the store
     * @param event - The event data
     */
    handleFinish(event: RaceFinishedEvent) {
      this.currentPlayer = event.player;
      this.state = event.state as unknown as TimeTrailRaceState;
      this.sessionName = event.sessionName;
      this.scoreboard = event.scoreboard;
    },
    /**
     * Reveal the current session's score
     */
    async revealScore() {
      this.loading = true;
      const score = await raceRevealScore();
      this.handleRevealScore(score.data!);
      this.loading = false;
    },
    /**
     * Handle a session's score being revealed and update the store
     * @param event - The event data
     */
    handleRevealScore(event: RaceScoreboardEvent) {
      this.currentPlayer = event.player;
      this.state = event.state as unknown as TimeTrailRaceState;
      this.sessionName = event.sessionName;
      this.scoreboard = event.scoreboard;
      this.startTime = undefined;
    },
    /**
     * Reset the current player - in case something went wrong
     */
    async resetPlayer() {
      this.loading = true;
      const reset = await raceResetPlayer();
      this.handleRevealScore(reset.data!);
      this.loading = false;
    },
    async init() {
      await this.getTimeTrailMode();

      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.on('race-player-registered', this.handleRegisterPlayer.bind(this));
      socketStore.backofficeSocket?.on('race-player-ready', this.handleReady.bind(this));
      socketStore.backofficeSocket?.on('race-player-start', this.handleStart.bind(this));
      socketStore.backofficeSocket?.on('race-player-finish', this.handleFinish.bind(this));
      socketStore.backofficeSocket?.on('race-scoreboard', this.handleRevealScore.bind(this));
    },
    /**
     * Quit the current session
     */
    async quit() {
      this.loading = true;
      await disableTimeTrailRacing();
      this.state = undefined;
      this.sessionName = undefined;
      this.scoreboard = [];
      this.loading = false;
    },
    /**
     * Destroy the store - unsubscribe from socket events
     */
    destroy() {
      const socketStore = useSocketStore();
      socketStore.backofficeSocket?.removeListener('race-player-registered', this.handleRegisterPlayer.bind(this));
      socketStore.backofficeSocket?.removeListener('race-player-ready', this.handleReady.bind(this));
      socketStore.backofficeSocket?.removeListener('race-player-start', this.handleStart.bind(this));
      socketStore.backofficeSocket?.removeListener('race-player-finish', this.handleFinish.bind(this));
      socketStore.backofficeSocket?.removeListener('race-scoreboard', this.handleRevealScore.bind(this));
    },
  },
});
