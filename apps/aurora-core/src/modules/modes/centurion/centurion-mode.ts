import BaseMode from '../base-mode';
import { LightsGroup } from '../../lights/entities';
import { Audio, Screen } from '../../root/entities';
import SetEffectsHandler from '../../handlers/lights/set-effects-handler';
import SimpleAudioHandler from '../../handlers/audio/simple-audio-handler';
import MixTape from '../../lights/mix-tape';
import { MusicEmitter } from '../../events';
import { CenturionScreenHandler } from '../../handlers/screen';
import { BeatManager } from '../../beats';
import logger from '../../../logger';
import LightsSwitchManager from '../../lights/lights-switch-manager';
import { FeatureEnabled, ServerSettingsStore } from '../../server-settings';
import { ISettings } from '../../server-settings/server-setting';
import RootLightsService from '../../lights/root-lights-service';
import { CenturionContext, CenturionPlaybackState, Lane } from './centurion-context';
import DiscoballController from './discoball-controller';
import CenturionBeatController from './centurion-beat-controller';
import RandomEffectPicker from './random-effect-picker';
import { CenturionCommand } from './commands/centurion-command';
import CenturionTimeline from './centurion-timeline';
import EmitterStore from '../../events/emitter-store';

const LIGHTS_HANDLER = 'SetEffectsHandler';
const AUDIO_HANDLER = 'SimpleAudioHandler';
const SCREEN_HANDLER = 'CenturionScreenHandler';
const SEEK_THRESHOLD = 1; // seconds

@FeatureEnabled('Centurion')
export default class CenturionMode extends BaseMode<
  SetEffectsHandler,
  CenturionScreenHandler,
  SimpleAudioHandler
> {
  public tape: MixTape;

  private cursor = 0;

  private anchor = { pos: 0, at: Date.now() };

  private timer?: NodeJS.Timeout;

  private lightsSwitchManager: LightsSwitchManager;

  private readonly playbackState: CenturionPlaybackState = {};

  private ctx: CenturionContext;

  private timeline: CenturionTimeline;

  private initialized = false;

  private readonly syncHandler = this.syncFeedEvents.bind(this);

  public get playing(): boolean {
    return this.timer !== undefined;
  }

  public get startTime(): Date {
    return new Date(this.anchor.at - this.anchor.pos * 1000);
  }

  constructor(lights: LightsGroup[], screens: Screen[], audios: Audio[]) {
    super(lights, screens, audios, LIGHTS_HANDLER, SCREEN_HANDLER, AUDIO_HANDLER);

    this.audioHandler.addSyncAudioTimingHandler(this.syncHandler);
  }

  public async initialize(musicEmitter: MusicEmitter) {
    if (this.initialized) throw new Error('CenturionMode already initialized!');
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
      musicEmitter: musicEmitter,
      lightsHandler: this.lightsHandler,
      screenHandler: this.screenHandler,
      discoBall: new DiscoballController(discoballs, this.lightsSwitchManager),
      beatController: new CenturionBeatController(BeatManager.getInstance()),
      randomEffects: new RandomEffectPicker(),
      stop: () => this.stop(),
    };
    this.initialized = true;
  }

  public get state(): Readonly<CenturionPlaybackState> {
    return this.playbackState;
  }

  public loadTape(tape: MixTape) {
    this.tape = tape;
    this.ctx.screenHandler.loaded(tape);
    this.ctx.coverUrl = tape.coverUrl;
    this.timeline = CenturionTimeline.fromMixTape(tape, this.ctx.discoBall.hasDiscoball);
    logger.info(`Initialized centurion tape "${tape.name}"`);
  }

  /**
   * Start playing the given mixtape and register all timed effects
   */
  public start(): boolean {
    if (this.playing) return true;
    if (this.anchor.pos >= this.tape.duration) this.anchor = { pos: 0, at: Date.now() };

    if (this.tape.songFile.startsWith('http')) {
      this.audioHandler.play(this.tape.songFile, this.anchor.pos);
    } else {
      this.audioHandler.play(`/static${this.tape.songFile}`, this.anchor.pos);
    }

    this.ctx.beatController.startBackground();
    this.seek(this.anchor.pos);

    this.ctx.screenHandler.start();
    EmitterStore.getInstance().backofficeSyncEmitter.emit('mode_centurion_update');
    logger.info('Started centurion playback.');
    return true;
  }

  /**
   * Continue playback at the given timestamp (in seconds)
   * @param seconds
   */
  public skip(seconds: number) {
    if (seconds < 0) throw new Error('Timestamp has to be positive');
    this.audioHandler.setPlayback(seconds);

    if (this.playing) this.seek(seconds);
    else this.anchor = { pos: seconds, at: Date.now() };
    logger.info(`Moved centurion playback to ${seconds} seconds.`);
  }

  /**
   * Stop playing the given mixtape and all its effects
   */
  public stop() {
    this.audioHandler.stop();
    this.ctx.screenHandler.stop();
    this.anchor = { pos: this.position(), at: Date.now() };
    clearTimeout(this.timer);
    this.timer = undefined;
    this.ctx.beatController.setSong();
    this.ctx.beatController.stopBackground();
    EmitterStore.getInstance().backofficeSyncEmitter.emit('mode_centurion_update');
    logger.info('Paused centurion playback.');
  }

  private position(): number {
    if (!this.playing) return this.anchor.pos;
    return this.anchor.pos + (Date.now() - this.anchor.at) / 1000;
  }

  /**
   * Restore every lane to its owner at t, then fire the commands after t on time
   * @param t tape position in seconds
   * @private
   */
  private seek(t: number) {
    clearTimeout(this.timer);
    this.timer = undefined;

    const owners = this.timeline.ownersAt(t);
    if (!owners.has('discoBall')) this.ctx.discoBall.disable();
    if (!owners.has('horn')) {
      this.ctx.state.lastHornEvent = undefined;
      this.ctx.screenHandler.hornCount(null);
    }
    if (!owners.has('song')) this.ctx.state.lastSongEvent = undefined;
    if (!owners.has('screenColors')) this.ctx.state.screenColors = undefined;
    this.ctx.lightsHandler.entities.forEach((l) => {
      const hasRgbs = l.movingHeadRgbs.length > 0;
      const hasWheels = l.movingHeadWheels.length > 0;
      if (
        (l.pars.length > 0 && !owners.has('parColor')) ||
        (hasRgbs && !owners.has('rgbColor')) ||
        (hasWheels && !owners.has('wheelColor'))
      ) {
        this.ctx.lightsHandler.removeColorEffect(l);
      }
      if ((hasRgbs && !owners.has('rgbMovement')) || (hasWheels && !owners.has('wheelMovement'))) {
        this.ctx.lightsHandler.removeMovementEffect(l);
      }
    });

    if (owners.has('bpm')) owners.get('bpm')!.restore(this.ctx, new Set<Lane>(['bpm']));
    else this.ctx.beatController.setSong();

    const lanesByCommand = new Map<CenturionCommand, Set<Lane>>();
    owners.forEach((cmd, lane) => {
      if (lane !== 'bpm') lanesByCommand.set(cmd, (lanesByCommand.get(cmd) ?? new Set()).add(lane));
    });

    const { commands } = this.timeline;
    [...lanesByCommand]
      .sort(([a], [b]) => commands.indexOf(a) - commands.indexOf(b))
      .forEach(([cmd, lanes]) => cmd.restore(this.ctx, lanes));

    this.anchor = { pos: t, at: Date.now() };
    this.cursor = this.timeline.indexAfter(t);
    // A restore never fires the StopCommand, so a seek at or past it stops here
    if (this.cursor === commands.length) this.stop();
    else this.arm();
  }

  private fireDue() {
    const { commands } = this.timeline;

    while (
      this.playing &&
      this.cursor < commands.length &&
      commands[this.cursor].startTime <= this.position()
    ) {
      commands[this.cursor++].execute(this.ctx);
    }
    if (this.playing) this.arm();
  }

  private arm() {
    clearTimeout(this.timer);
    const next = this.timeline.commands[this.cursor];
    this.timer = next
      ? setTimeout(
          () => this.fireDue(),
          Math.max(0, Math.ceil((next.startTime - this.position()) * 1000)),
        )
      : undefined;
  }

  /**
   * Synchronize the feed events with the currently playing audio
   * @param startTime
   * @param timestamp progression of the audio in ms
   * @private
   */
  private syncFeedEvents({ startTime, timestamp }: { startTime: number; timestamp: number }) {
    if (!this.playing) return;
    const t = (timestamp + Date.now() - startTime) / 1000;

    if (Math.abs(t - this.position()) > SEEK_THRESHOLD) {
      this.seek(t);
      return;
    }

    this.anchor = { pos: t, at: Date.now() };
    this.arm();
  }

  /**
   * Remove all handlers from these entities
   */
  public destroy() {
    this.stop();
    this.audioHandler.removeSyncAudioTimingHandler(this.syncHandler);
    super.destroy();
  }
}
