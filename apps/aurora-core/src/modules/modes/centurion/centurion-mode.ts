import BaseMode from '../base-mode';
import { LightsGroup, LightsSwitch } from '../../lights/entities';
import { Audio, Screen } from '../../root/entities';
import SetEffectsHandler from '../../handlers/lights/set-effects-handler';
import SimpleAudioHandler from '../../handlers/audio/simple-audio-handler';
import MixTape, { FeedEvent, Horn, Song, SongData } from './tapes/mix-tape';
import { BeatFadeOut, StaticColor } from '../../lights/effects/color';
import { ClassicRotate, SearchLight, TableRotate } from '../../lights/effects/movement';
import { getTwoComplementaryRgbColors, RgbColor } from '../../lights/color-definitions';
import { MusicEmitter } from '../../events';
import { TrackChangeEvent } from '../../events/music-emitter-events';
import { CenturionScreenHandler } from '../../handlers/screen';
import { LightsEffectBuilder } from '../../lights/effects/lights-effect';
import Wave from '../../lights/effects/color/wave';
import Sparkle from '../../lights/effects/color/sparkle';
import { BeatManager, BeatPriorities, SimpleBeatGenerator } from '../../beats';
import logger from '../../../logger';
import LightsSwitchManager from '../../root/lights-switch-manager';
import { FeatureEnabled, ServerSettingsStore } from '../../server-settings';
import { ISettings } from '../../server-settings/server-setting';
import RootLightsService from '../../root/root-lights-service';
import {
  getRandomLightsEffectDirection,
  getRandomLightsEffectPattern,
  LightsEffectDirection,
  LightsEffectPattern,
} from '../../lights/effects/lights-effect-pattern';

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

  private discoballs: LightsSwitch[] = [];

  private musicEmitter: MusicEmitter;

  private feedEvents: {
    event: FeedEvent;
    timeouts: NodeJS.Timeout[];
  }[] = [];

  private timestamp: number = 0;

  public startTime: Date = new Date();

  public lastHornEvent?: Horn & { timestamp: number };

  public lastSongEvent?: Song & { timestamp: number };

  public currentColors?: RgbColor[];

  private beatManager: BeatManager;

  private beatGeneratorBackground: SimpleBeatGenerator;

  private beatGeneratorSong: SimpleBeatGenerator | undefined;

  private lightsSwitchManager: LightsSwitchManager;

  private initialized = false;

  public get playing(): boolean {
    // If we have registered events, we are playing audio
    return this.feedEvents.length > 0;
  }

  constructor(lights: LightsGroup[], screens: Screen[], audios: Audio[]) {
    super(lights, screens, audios, LIGHTS_HANDLER, SCREEN_HANDLER, AUDIO_HANDLER);

    this.audioHandler.addSyncAudioTimingHandler(this.syncFeedEvents.bind(this));
    this.beatManager = BeatManager.getInstance();
  }

  public async initialize(musicEmitter: MusicEmitter) {
    if (this.initialized) throw new Error('CenturionMode already initialized!');
    this.musicEmitter = musicEmitter;
    this.lightsSwitchManager = LightsSwitchManager.getInstance();

    const discoballIds = ServerSettingsStore.getInstance().getSetting(
      'Centurion.DiscoballLightsSwitchIds',
    ) as ISettings['Centurion.DiscoballLightsSwitchIds'];
    this.discoballs = (await new RootLightsService().getAllLightsSwitches()).filter((s) =>
      discoballIds.includes(s.id),
    );

    // Disable the disco ball if they are enabled
    this.lightsSwitchManager.getEnabledSwitches().forEach((s) => {
      if (discoballIds.includes(s.id)) {
        this.lightsSwitchManager.disableSwitch(s);
      }
    });
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
    this.beatGeneratorBackground = new SimpleBeatGenerator(
      'background',
      'Centurion (Background)',
      130,
    );
    this.beatManager.add(this.beatGeneratorBackground, BeatPriorities.BACKGROUND_BEAT_GENERATOR);
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
      if (this.hasDiscoBall()) {
        this.discoballs.forEach((s) => {
          this.lightsSwitchManager.disableSwitch(s);
        });
      }

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
    this.setSongBeatGenerator();
    this.beatManager.remove(this.beatGeneratorBackground.getId());
    logger.info('Paused centurion playback.');

    this.timestamp = (new Date().getTime() - this.startTime.getTime()) / 1000;
  }

  /**
   * Returns whether a disco ball is present in the centurion lights setup
   * @private
   */
  private hasDiscoBall(): boolean {
    return this.discoballs.length > 0;
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

  private getRandomMovementEffectSide(): LightsEffectBuilder {
    if (!this.beatGeneratorSong) {
      return TableRotate.build();
    }

    // Baseline: cycle time of 10000ms for 120bpm
    const baseCycleTime = Math.round(1200000 / this.beatGeneratorSong.bpm);
    return TableRotate.build({ cycleTime: baseCycleTime });
  }

  private getRandomMovementEffectCenter(): LightsEffectBuilder {
    // If we do not have a bpm, choose SearchLight as the default
    const defaultEffect = SearchLight.build({ radiusFactor: 1.5, cycleTime: 3000 });
    if (!this.beatGeneratorSong) {
      return defaultEffect;
    }

    const baseCycleTime = Math.round(360000 / this.beatGeneratorSong.bpm);
    const classicRotateProb = Math.max(0, Math.min(1, (this.beatGeneratorSong.bpm - 120) / 60));

    const effects = [
      {
        effect: ClassicRotate.build({ cycleTime: baseCycleTime * 4 }),
        probability: classicRotateProb,
      },
      {
        effect: SearchLight.build({ radiusFactor: 1.5, cycleTime: baseCycleTime }),
        probability: 1 - classicRotateProb,
      },
    ];
    let factor = Math.random();

    return (
      effects.find((effect, i) => {
        const previous = effects.slice(0, i).reduce((x, e) => x + e.probability, 0);
        return previous <= factor && previous + effect.probability > factor;
      })?.effect || defaultEffect
    );
  }

  /**
   * Get a random effect given a set of colors
   * @param colors
   * @private
   */
  private getRandomParEffect(colors: RgbColor[]): LightsEffectBuilder {
    const pattern = getRandomLightsEffectPattern();
    const direction = getRandomLightsEffectDirection();

    const effects = [
      {
        effect: BeatFadeOut.build({
          colors,
          enableFade: false,
          nrBlacks: 1,
          pattern,
          direction,
        }),
        probability: 0.8,
      },
      {
        effect: Sparkle.build({ colors }),
        probability: 0.1,
      },
      {
        effect: Wave.build({
          colors: colors,
          pattern,
          direction,
        }),
        probability: 0.1,
      },
    ];
    let factor = Math.random();

    if (!this.beatGeneratorSong || this.beatGeneratorSong.bpm < 120) {
      // If the music is relatively slow or really fast, do not use wave or sparkle
      factor = factor - 0.2;
    } else if (this.beatGeneratorSong && this.beatGeneratorSong.bpm > 160) {
      // If the music is really fast, do not use wave, as the other effects will be
      // much more energetic
      factor = factor - 0.1;
    }

    console.log(factor);

    return (
      effects.find((effect, i) => {
        const previous = effects.slice(0, i).reduce((x, e) => x + e.probability, 0);
        return previous <= factor && previous + effect.probability > factor;
      })?.effect || effects[0].effect
    );
  }

  /**
   * Reset the song beat generator: restart it with the given BPM if BPM is defined, else stop.
   * @param bpm
   * @private
   */
  private setSongBeatGenerator(bpm?: number) {
    if (this.beatGeneratorSong) {
      this.beatManager.remove(this.beatGeneratorSong.getId());
      this.beatGeneratorSong = undefined;
    }

    if (bpm) {
      this.beatGeneratorSong = new SimpleBeatGenerator('centurion', 'Centurion', bpm);
      this.beatManager.add(this.beatGeneratorSong, BeatPriorities.CENTURION_BEAT_GENERATOR);
    }
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
    this.setSongBeatGenerator(bpm);
  }

  /**
   * Pick random colors and random effects to show using lights and screens
   * @private
   */
  private setRandomLightEffects() {
    const { colorNames } = getTwoComplementaryRgbColors();
    this.currentColors = colorNames;

    const newMovementEffectSideBuilder = this.getRandomMovementEffectSide();
    const newMovementEffectCenterBuilder = this.getRandomMovementEffectCenter();
    const movingHeadEffectColor = StaticColor.build({ color: RgbColor.WHITE });
    const newEffectBuilder = this.getRandomParEffect(colorNames);

    this.lights.forEach((l) => {
      // If we have a moving head, assign a movement effect
      if ((l.movingHeadRgbs.length > 0 || l.movingHeadWheels.length > 0) && l.groupInMiddle) {
        this.lightsHandler.setMovementEffect(l, [newMovementEffectCenterBuilder]);
      }
      if (l.movingHeadRgbs.length > 0 || l.movingHeadWheels.length > 0) {
        this.lightsHandler.setMovementEffect(l, [newMovementEffectSideBuilder]);
      }
      // If we have a wheel moving head, assign a static color
      if (l.movingHeadWheels.length > 0) {
        this.lightsHandler.setColorEffect(l, [movingHeadEffectColor]);
        // Otherwise use a random effect!
      } else {
        this.lightsHandler.setColorEffect(l, [newEffectBuilder]);
      }
    });
    this.screenHandler.changeColors(colorNames);
  }

  /**
   * Handle a fired event
   * @param event
   * @private
   */
  private handleFeedEvent(event: FeedEvent) {
    logger.debug(event);

    if (event.type === 'horn') {
      this.lastHornEvent = event;
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
      this.lastSongEvent = event;
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
        if (event.data.discoBall && isEffectDisableAll && !this.hasDiscoBall()) {
          // If we want to only have the disco ball turned on, but our setup does not have one,
          // we should just do random light effects
          event.data.random = true;
        } else if (event.data.discoBall && this.hasDiscoBall()) {
          // Enable disco ball
          this.discoballs.forEach((s) => {
            this.lightsSwitchManager.enableSwitch(s);
          });
        } else if (this.hasDiscoBall()) {
          // Disable all disco ball if they should not be enabled
          this.discoballs.forEach((s) => {
            this.lightsSwitchManager.disableSwitch(s);
          });
        }
        if (event.data.reset) {
          // Reset effect
          this.lightsHandler.removeColorEffect(l);
          this.lightsHandler.removeMovementEffect(l);
          return;
        }
        if (event.data.random) {
          this.setRandomLightEffects();
          // Restart the beat generator to ensure no quick successive beats when the lights change
          this.beatGeneratorBackground.restart();
          if (this.beatGeneratorSong) this.beatGeneratorSong.restart();
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
      this.setSongBeatGenerator(event.data.bpm);
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
