import BaseLightsHandler from '../base-lights-handler';
import { BeatEvent, TrackChangeEvent } from '../../events/music-emitter-events';
import { LightsGroup } from '../../lights/entities';
import { LightsTrackEffect } from '../../lights/entities/sequences/lights-track-effect';
import LightsEffect from '../../lights/effects/lights-effect';
import dataSource from '../../../database';
import { MusicEmitter } from '../../events';
import logger from '../../../logger';
import { databaseEffectToObject } from './database-effects-helper';

interface LightsGroupEffectBase {
  startMs: number;
  durationMs: number;
  endMs: number;
  id: number;
}

interface ActiveLightsGroupEffect extends LightsGroupEffectBase {
  effect: LightsEffect;
}

interface LightsGroupEffect extends LightsGroupEffectBase {
  lightsGroupIds: number[];
  effectName: string;
  effectProps: any;
}

export default class EffectSequenceHandler extends BaseLightsHandler {
  private sequence: LightsTrackEffect[] = [];

  private sequenceStart: Date = new Date(0);

  private lastTick = new Date();

  private activeEffects: ActiveLightsGroupEffect[] = [];

  private events: LightsGroupEffect[] = [];

  constructor(musicEmitter: MusicEmitter) {
    super();
    musicEmitter.on('stop', this.stopAudio.bind(this));
  }

  /**
   * Given a sequence of effects and the track start time,
   * register all effect changes as NodeJS Timeouts
   * @param startTime
   * @private
   */
  private startSequence(startTime: Date) {
    this.sequenceStart = startTime;

    const now = new Date();
    const progression = now.getTime() - startTime.getTime();

    const timestamps = Array.from(new Set(this.sequence.map((s) => s.timestamp))).sort();

    this.events = timestamps
      .map((timestamp): LightsGroupEffect[] => {
        const predefinedEffects = this.sequence.filter((s) => s.timestamp === timestamp);
        return predefinedEffects.map(
          (e): LightsGroupEffect => ({
            startMs: e.timestamp,
            durationMs: e.duration,
            endMs: e.timestamp + e.duration,
            effectName: e.effect,
            effectProps: JSON.parse(e.effectProps),
            lightsGroupIds: e.lightGroups.map((l) => l.id),
            id: e.id,
          }),
        );
      })
      .flat();

    // Get all effects that have passed the relative start time
    // but not the relative end time
    const currentlyActiveEffects = this.events.filter(
      (e) => e.startMs < progression && e.endMs > progression,
    );
    currentlyActiveEffects.forEach((e) => this.startEffect(e));

    return this.events;
  }

  /**
   * Start the given (planned) effect
   * @param effectToActivate
   * @private
   */
  private startEffect(effectToActivate: LightsGroupEffect) {
    // Get the light groups this effect should apply to
    const lightsGroups = this.entities.filter((e) =>
      effectToActivate.lightsGroupIds.includes(e.id),
    );

    const effects = lightsGroups.map((g) =>
      databaseEffectToObject(g, effectToActivate.effectName, effectToActivate.effectProps),
    );

    const activeEffects: ActiveLightsGroupEffect[] = effects.map((effect) => ({
      effect,
      startMs: effectToActivate.startMs,
      durationMs: effectToActivate.durationMs,
      endMs: effectToActivate.endMs,
      id: effectToActivate.id,
    }));

    this.activeEffects.push(...activeEffects);
  }

  /**
   * Stop or pause audio playback and thus the effects changing
   * We do not need to pause any effects, because the effects
   * should do that themselves when they do not receive any beats/ticks
   * @private
   */
  private stopSequence(blackout = false) {
    if (blackout) this.activeEffects.forEach((e) => e.effect.lightsGroup.blackout());
    this.activeEffects = [];
    this.events = [];
  }

  /**
   * Propagate the track's beat to all active effects
   * @param event
   */
  beat(event: BeatEvent): void {
    this.activeEffects.forEach(({ effect }) => effect.beat(event));
    this.sequenceStart = new Date(new Date().getTime() - event.beat.start * 1000);
  }

  /**
   * Handle the event loop tick.
   * Before calculating the new state of all the effects, stop/remove any
   * effects that have been expired (i.e. whose duration is over) and
   * start any new effects.
   * Blackout all lightgroups that had an effect before, but not anymore.
   */
  tick(): LightsGroup[] {
    // Remove any expired events
    const songProgression = new Date().getTime() - this.sequenceStart.getTime();
    const songProgressionPreviousTick = this.lastTick.getTime() - this.sequenceStart.getTime();
    const expiredEffects = this.activeEffects.filter((e) => e.endMs <= songProgression);
    // Blackout the lights to prevent the lights from staying on afterwards
    expiredEffects.forEach((e) => {
      e.effect.lightsGroup.blackout();
      e.effect.destroy();
    });

    const expiredEffectIndices = expiredEffects.map((e) => e.id);
    this.activeEffects = this.activeEffects.filter((e) => !expiredEffectIndices.includes(e.id));

    const effectsToStart = this.events.filter(
      (e) => e.startMs > songProgressionPreviousTick && e.startMs <= songProgression,
    );
    effectsToStart.forEach((e) => this.startEffect(e));

    this.lastTick = new Date();

    this.activeEffects.forEach(({ effect }) => effect.tick());
    return this.entities;
  }

  /**
   * Handle a change of the currently playing track
   * @param event
   */
  changeTrack([event]: TrackChangeEvent[]): void {
    if (this.entities.length === 0) return;

    this.stopSequence(true);

    dataSource
      .getRepository(LightsTrackEffect)
      .find({
        where: { trackUri: event.trackURI },
        relations: { lightGroups: true },
      })
      .then((sequence) => {
        this.sequence = sequence;
        this.startSequence(event.startTime);
      })
      .catch((e) => logger.error(e));
  }

  /**
   * Handle stopping playing audio
   */
  stopAudio(): void {
    this.stopSequence(false);
  }

  /**
   * Override removeEntity function to stop the sequence when no entities are left
   * @param entity
   */
  removeEntity(entity: LightsGroup) {
    super.removeEntity(entity);

    if (this.entities.length === 0) {
      this.stopSequence();
    }
  }
}
