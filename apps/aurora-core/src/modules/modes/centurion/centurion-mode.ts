import BaseMode from '../base-mode';
import { LightsGroup } from '../../lights/entities';
import { Audio, Screen } from '../../root/entities';
import SetEffectsHandler from '../../handlers/lights/set-effects-handler';
import SimpleAudioHandler from '../../handlers/audio/simple-audio-handler';
import MixTape, { FeedEvent, SongData } from '../../lights/mix-tape';
import { getTwoComplementaryRgbColors } from '../../lights/color-definitions';
import { MusicEmitter } from '../../events';
import { TrackChangeEvent } from '../../events/music-emitter-events';
import { CenturionScreenHandler } from '../../handlers/screen';
import { BeatManager } from '../../beats';
import logger from '../../../logger';
import LightsSwitchManager from '../../lights/lights-switch-manager';
import { FeatureEnabled, ServerSettingsStore } from '../../server-settings';
import { ISettings } from '../../server-settings/server-setting';
import RootLightsService from '../../lights/root-lights-service';
import { CenturionContext, CenturionPlaybackState } from './centurion-context';
import DiscoballController from './discoball-controller';
import CenturionBeatController from './centurion-beat-controller';
import RandomEffectPicker from './random-effect-picker';

const LIGHTS_HANDLER = 'SetEffectsHandler';
const AUDIO_HANDLER = 'SimpleAudioHandler';
const SCREEN_HANDLER = 'CenturionScreenHandler';
const STROBE_TIME = 1500; // Milliseconds

@FeatureEnabled('Centurion')
export default class CenturionMode extends BaseMode<
  SetEffectsHandler,
  CenturionScreenHandler,
  SimpleAudioHandler
> {
  public tape: MixTape;

  private musicEmitter: MusicEmitter;

  private feedEvents: {
    event: FeedEvent;
    timeouts: NodeJS.Timeout[];
  }[] = [];

  private timestamp: number = 0;

  public startTime: Date = new Date();

  private lightsSwitchManager: LightsSwitchManager;

  private readonly playbackState: CenturionPlaybackState = {};

  private ctx: CenturionContext;

  private initialized = false;

  public get playing(): boolean {
    // If we have registered events, we are playing audio
    return this.feedEvents.length > 0;
  }

  constructor(lights: LightsGroup[], screens: Screen[], audios: Audio[]) {
    super(lights, screens, audios, LIGHTS_HANDLER, SCREEN_HANDLER, AUDIO_HANDLER);

    this.audioHandler.addSyncAudioTimingHandler(this.syncFeedEvents.bind(this));
  }

  public async initialize(musicEmitter: MusicEmitter) {
    if (this.initialized) throw new Error('CenturionMode already initialized!');
    this.musicEmitter = musicEmitter;
    this.lightsSwitchManager = LightsSwitchManager.getInstance();

    const discoballIds = ServerSettingsStore.getInstance().getSetting(
      'Centurion.DiscoballLightsSwitchIds',
    ) as ISettings['Centurion.DiscoballLightsSwitchIds'];
    const discoballs = (await new RootLightsService().getAllLightsSwitches()).filter((s) =>
      discoballIds.includes(s.id),
    );

    // Disable the disco ball if they are enabled
    this.lightsSwitchManager.getEnabledSwitches().forEach((s) => {
      if (discoballIds.includes(s.id)) {
        this.lightsSwitchManager.disableSwitch(s);
      }
    });

    this.ctx = {
      state: this.playbackState,
      lightsHandler: this.lightsHandler,
      screenHandler: this.screenHandler,
      discoBall: new DiscoballController(discoballs, this.lightsSwitchManager),
      beatController: new CenturionBeatController(BeatManager.getInstance()),
      randomEffects: new RandomEffectPicker(),
    };
  }

  public get state(): Readonly<CenturionPlaybackState> {
    return this.playbackState;
  }

  public loadTape(tape: MixTape) {
    this.tape = tape;
    this.screenHandler.loaded(tape);
    logger.info(`Initialized centurion tape "${tape.name}"`);
  }

  /**
   * Start playing the given mixtape and register all timed effects
   */
  public start(): boolean {
    if (this.tape.songFile.startsWith('http')) {
      this.audioHandler.play(this.tape.songFile, this.timestamp);
    } else {
      this.audioHandler.play(`/static${this.tape.songFile}`, this.timestamp);
    }

    this.registerFeedEvents(this.timestamp);
    this.fireLastFeedEvent(this.timestamp);

    this.screenHandler.start();
    this.ctx.beatController.startBackground();
    logger.info('Started centurion playback.');
    return true;
  }

  /**
   * Continue playback at the given timestamp (in seconds)
   * @param seconds
   */
  public skip(seconds: number) {
    if (seconds < 0) throw new Error('Timestamp has to be positive');
    this.timestamp = seconds;
    this.audioHandler.setPlayback(seconds);

    if (this.playing) {
      // Lazy solution for figuring out whether the discoball should be on:
      // let's just disable it by default
      if (this.ctx.discoBall.hasDiscoball) this.ctx.discoBall.disable();

      this.registerFeedEvents(seconds);
      this.fireLastFeedEvent(seconds);
    }
    logger.info(`Moved centurion playback to ${seconds} seconds.`);
  }

  /**
   * Stop playing the given mixtape and all its effects
   */
  public stop() {
    this.audioHandler.stop();
    this.screenHandler.stop();
    this.stopFeedEvents();
    this.ctx.beatController.setSong();
    this.ctx.beatController.stopBackground();
    logger.info('Paused centurion playback.');

    this.timestamp = (new Date().getTime() - this.startTime.getTime()) / 1000;
  }

  /**
   * Broadcast the track we are currently listening to within Aurora
   * @param song
   * @private
   */
  private emitSong(song: SongData | SongData[]) {
    let songs: SongData[];
    if (!Array.isArray(song)) {
      songs = [song];
    } else {
      songs = song;
    }

    this.musicEmitter.emitAudio(
      'change_track',
      songs.map((s) => ({
        title: s.title,
        artists: s.artist.split(', '),
        cover: this.tape.coverUrl,
      })) as TrackChangeEvent[],
    );
  }

  /**
   * Change the beat generator BPM to the speed defined in the song, if it exists. If it does not
   * exist, stop the song beat generator.
   * @param songData
   * @private
   */
  private setBpmFromSong(songData: SongData | SongData[]) {
    let bpm: number | undefined;
    if (Array.isArray(songData)) {
      bpm = songData.find((s) => s.bpm !== undefined)?.bpm;
    } else {
      bpm = songData.bpm;
    }
    this.ctx.beatController.setSong(bpm);
  }

  /**
   * Pick random colors and random effects to show using lights and screens
   * @private
   */
  private setRandomLightEffects() {
    this.ctx.state.screenColors = getTwoComplementaryRgbColors().colorNames;
    this.screenHandler.changeColors(this.ctx.state.screenColors);
    this.ctx.randomEffects.apply(this.ctx, this.ctx.state.screenColors);
  }

  /**
   * Handle a fired event
   * @param event
   * @private
   */
  private handleFeedEvent(event: FeedEvent) {
    logger.debug(event);

    if (event.type === 'horn') {
      this.ctx.state.lastHornEvent = event;
      this.lights.forEach((l) => {
        l.pars.forEach((p) => p.fixture.enableStrobe(event.data.strobeTime ?? STROBE_TIME));
        l.movingHeadRgbs.forEach((p) =>
          p.fixture.enableStrobe(event.data.strobeTime ?? STROBE_TIME),
        );
        l.movingHeadWheels.forEach((p) =>
          p.fixture.enableStrobe(event.data.strobeTime ?? STROBE_TIME),
        );
      });
      this.screenHandler.horn(event.data.strobeTime ?? STROBE_TIME, event.data.counter);
    } else if (event.type === 'song') {
      this.ctx.state.lastSongEvent = event;
      this.setBpmFromSong(event.data);
      // Set effects after setting bpm, because the effects might need the bpm
      this.setRandomLightEffects();
      this.emitSong(event.data);
    } else if (event.type === 'effect') {
      const isEffectDisableAll =
        event.data.reset ||
        (event.data.effects.pars &&
          event.data.effects.pars.length === 0 &&
          event.data.effects.movingHeadRgbColor &&
          event.data.effects.movingHeadRgbColor.length === 0 &&
          event.data.effects.movingHeadRgbMovement &&
          event.data.effects.movingHeadRgbMovement.length === 0 &&
          event.data.effects.movingHeadWheelColor &&
          event.data.effects.movingHeadWheelColor.length === 0 &&
          event.data.effects.movingHeadWheelMovement &&
          event.data.effects.movingHeadWheelMovement.length === 0);

      this.lights.forEach((l) => {
        if (event.data.discoBall && isEffectDisableAll && !this.ctx.discoBall.hasDiscoball)
          event.data.random = true;
        else if (event.data.discoBall && this.ctx.discoBall.hasDiscoball)
          this.ctx.discoBall.enable();
        else if (this.ctx.discoBall.hasDiscoball) this.ctx.discoBall.disable();
        if (event.data.reset) {
          // Reset effect
          this.lightsHandler.removeColorEffect(l);
          this.lightsHandler.removeMovementEffect(l);
          return;
        }
        if (event.data.random) {
          this.setRandomLightEffects();
          // Restart the beat generator to ensure no quick successive beats when the lights change
          this.ctx.beatController.restart();
          return;
        }
        if (l.pars.length > 0 && event.data.effects.pars) {
          // Color effect for pars
          this.lightsHandler.setColorEffect(l, event.data.effects.pars);
        }
        if (l.movingHeadRgbs.length > 0) {
          // Color effect for moving head rgb
          if (event.data.effects.movingHeadRgbColor)
            this.lightsHandler.setColorEffect(l, event.data.effects.movingHeadRgbColor);
          // Movement effect for moving head rgb
          if (event.data.effects.movingHeadRgbMovement)
            this.lightsHandler.setMovementEffect(l, event.data.effects.movingHeadRgbMovement);
        }
        if (l.movingHeadWheels.length > 0) {
          // Color effect for moving head wheel
          if (event.data.effects.movingHeadWheelColor)
            this.lightsHandler.setColorEffect(l, event.data.effects.movingHeadWheelColor);
          // Movement effect for moving head wheel
          if (event.data.effects.movingHeadWheelMovement)
            this.lightsHandler.setMovementEffect(l, event.data.effects.movingHeadWheelMovement);
        }
      });
    } else if (event.type === 'bpm') {
      this.ctx.beatController.setSong(event.data.bpm);
    } else if (event.type === 'other' && event.data === 'stop') {
      this.stop();
    }
  }

  /**
   * Fire the last past event
   * @param seconds
   * @private
   */
  private fireLastFeedEvent(seconds: number) {
    const pastEvents = this.tape.feed
      .filter((e) => e.type === 'song' || e.type === 'effect')
      .filter((e) => e.timestamp <= seconds);
    if (pastEvents.length === 0) return;

    this.handleFeedEvent(pastEvents[pastEvents.length - 1]);
  }

  /**
   * Register events
   * @param seconds seconds since start of the track
   * @private
   */
  private registerFeedEvents(seconds: number = 0): void {
    if (this.feedEvents.length > 0) {
      this.stopFeedEvents();
    }

    this.startTime = new Date(new Date().getTime() - seconds * 1000);

    const stopEvent: FeedEvent = {
      type: 'other',
      data: 'stop',
      timestamp: this.tape.duration,
    };

    [...this.tape.feed, stopEvent]
      .filter((e) => e.timestamp >= seconds)
      .forEach((event) => {
        const timestampMillis = Math.round((event.timestamp - seconds) * 1000);
        const timeouts = [setTimeout(this.handleFeedEvent.bind(this, event), timestampMillis)];

        this.feedEvents.push({
          event,
          timeouts,
        });
      });
  }

  private stopFeedEvents() {
    this.feedEvents.forEach((e): void => {
      e.timeouts.forEach((t) => clearTimeout(t));
    });
    this.feedEvents = [];
  }

  /**
   * Synchronize the feed events with the currently playing audio
   * @param sendTime the time the sync packet has been sent (to synchronize clocks)
   * in ms since epoch
   * @param timestamp progression of the audio in ms
   * @private
   */
  private syncFeedEvents({ startTime, timestamp }: { startTime: number; timestamp: number }) {
    const msDifference = new Date().getTime() - startTime;

    this.registerFeedEvents((timestamp + msDifference) / 1000);
  }

  /**
   * Remove all handlers from these entities
   */
  public destroy() {
    this.stop();
    this.audioHandler.removeSyncAudioTimingHandler(this.syncFeedEvents.bind(this));
    super.destroy();
  }
}
