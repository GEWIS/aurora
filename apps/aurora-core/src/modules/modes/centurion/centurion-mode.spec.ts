import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CenturionMode from './centurion-mode';
import MixTape from '../../lights/mix-tape';
import { LightsGroup, LightsSwitch } from '../../lights/entities';
import { LightsEffectBuilder } from '../../lights/effects/lights-effect';
import { BeatPriorities, SimpleBeatGenerator } from '../../beats';
import { MusicEmitter } from '../../events';
import { TableRotate } from '../../lights/effects/movement';
import EmitterStore from '../../events/emitter-store';

const state = vi.hoisted(() => ({
  handlers: [] as unknown[],
  discoballIds: [] as number[],
  switches: [] as unknown[],
  switchManager: undefined as unknown,
  beatManager: undefined as unknown,
}));

vi.mock('../../server-settings', () => ({
  FeatureEnabled: () => (target: unknown) => target,
  ServerSettingsStore: {
    getInstance: () => ({ getSetting: () => state.discoballIds }),
  },
}));

vi.mock('../../root/handler-manager', () => ({
  default: {
    getInstance: () => ({
      registerHandler: () => {},
      getHandler: () => undefined,
      getHandlers: () => state.handlers,
    }),
  },
}));

vi.mock('../../lights/lights-switch-manager', () => ({
  default: { getInstance: () => state.switchManager },
}));

vi.mock('../../lights/root-lights-service', () => ({
  default: class {
    getAllLightsSwitches = async () => state.switches;
  },
}));

vi.mock('../../beats', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../beats')>()),
  BeatManager: { getInstance: () => state.beatManager },
}));

class SetEffectsHandler {
  entities: LightsGroup[] = [];

  setColorEffect = vi.fn();

  setMovementEffect = vi.fn();

  removeColorEffect = vi.fn();

  removeMovementEffect = vi.fn();
}

class CenturionScreenHandler {
  entities = [];

  loaded = vi.fn();

  start = vi.fn();

  stop = vi.fn();

  horn = vi.fn();

  hornCount = vi.fn();

  changeColors = vi.fn();
}

type SyncHandler = (params: { startTime: number; timestamp: number }) => void;

class SimpleAudioHandler {
  entities = [];

  play = vi.fn();

  stop = vi.fn();

  setPlayback = vi.fn();

  syncHandlers: SyncHandler[] = [];

  addSyncAudioTimingHandler = vi.fn((handler: SyncHandler) => this.syncHandlers.push(handler));

  removeSyncAudioTimingHandler = vi.fn((handler: SyncHandler) => {
    this.syncHandlers = this.syncHandlers.filter((h) => h !== handler);
  });
}

class FakeBeatManager {
  generators: { generator: SimpleBeatGenerator; priority: number }[] = [];

  get active() {
    return new Map(this.generators.map((g) => [g.generator.getId(), g]));
  }

  add = vi.fn((generator: SimpleBeatGenerator, priority: number) => {
    generator.setPropagator({ sendBeat: () => {} });
    vi.spyOn(generator, 'restart');
    this.generators.push({ generator, priority });
  });

  // Like BeatManager: removes only the first generator with the id
  remove = vi.fn((id: string) => {
    const index = this.generators.findIndex((g) => g.generator.getId() === id);
    if (index >= 0) this.generators.splice(index, 1);
  });
}

describe('CenturionMode', () => {
  const discoBallSwitch = { id: 7 } as LightsSwitch;
  const builder = () => vi.fn() as unknown as LightsEffectBuilder;
  const fixture = () => ({ fixture: { enableStrobe: vi.fn() } });

  let lightsHandler: SetEffectsHandler;
  let screenHandler: CenturionScreenHandler;
  let audioHandler: SimpleAudioHandler;
  let switchManager: {
    enableSwitch: ReturnType<typeof vi.fn>;
    disableSwitch: ReturnType<typeof vi.fn>;
  };
  let beatManager: FakeBeatManager;
  let musicEmitter: { emitAudio: ReturnType<typeof vi.fn> };
  let parGroup: LightsGroup;
  let headGroup: LightsGroup;
  let effectBuilders: Record<
    | 'pars'
    | 'movingHeadRgbColor'
    | 'movingHeadRgbMovement'
    | 'movingHeadWheelColor'
    | 'movingHeadWheelMovement',
    LightsEffectBuilder[]
  >;
  let tape: MixTape;
  let mode: CenturionMode;

  beforeEach(() => {
    vi.useFakeTimers();

    parGroup = {
      id: 1,
      groupInMiddle: false,
      pars: [fixture(), fixture()],
      movingHeadRgbs: [],
      movingHeadWheels: [],
    } as unknown as LightsGroup;
    headGroup = {
      id: 2,
      groupInMiddle: true,
      pars: [],
      movingHeadRgbs: [fixture()],
      movingHeadWheels: [fixture()],
    } as unknown as LightsGroup;

    lightsHandler = new SetEffectsHandler();
    lightsHandler.entities = [parGroup, headGroup];
    screenHandler = new CenturionScreenHandler();
    audioHandler = new SimpleAudioHandler();
    switchManager = { enableSwitch: vi.fn(), disableSwitch: vi.fn() };
    beatManager = new FakeBeatManager();
    musicEmitter = { emitAudio: vi.fn() };

    state.handlers = [lightsHandler, screenHandler, audioHandler];
    state.discoballIds = [discoBallSwitch.id];
    state.switches = [discoBallSwitch];
    state.switchManager = { ...switchManager, getEnabledSwitches: () => [] };
    state.beatManager = beatManager;

    effectBuilders = {
      pars: [builder()],
      movingHeadRgbColor: [builder()],
      movingHeadRgbMovement: [builder()],
      movingHeadWheelColor: [builder()],
      movingHeadWheelMovement: [builder()],
    };
    tape = {
      artist: 'Artist',
      name: 'Tape',
      songFile: '/audio/tape.mp3',
      coverUrl: '/cover.png',
      duration: 70,
      feed: [
        { timestamp: 0, type: 'song', data: { artist: 'A1, A2', title: 'Song A', bpm: 140 } },
        { timestamp: 10, type: 'horn', data: { counter: 1 } },
        {
          timestamp: 20,
          type: 'effect',
          data: {
            discoBall: true,
            effects: {
              pars: [],
              movingHeadRgbColor: [],
              movingHeadRgbMovement: [],
              movingHeadWheelColor: [],
              movingHeadWheelMovement: [],
            },
          },
        },
        { timestamp: 25, type: 'song', data: { artist: 'B', title: 'Song B' } },
        { timestamp: 30, type: 'bpm', data: { bpm: 160 } },
        { timestamp: 40, type: 'effect', data: { effects: effectBuilders } },
        { timestamp: 50, type: 'effect', data: { random: true, effects: {} } },
        { timestamp: 60, type: 'effect', data: { reset: true, effects: {} } },
      ],
    };
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  async function createMode() {
    mode = new CenturionMode([parGroup, headGroup], [], []);
    await mode.initialize(musicEmitter as unknown as MusicEmitter);
    mode.loadTape(tape);
  }

  // Plays from 0 until just before the given second, then fires only the events at that second
  function playUntil(seconds: number) {
    mode.start();
    vi.advanceTimersByTime(seconds * 1000 - 1);
    vi.clearAllMocks();
    vi.advanceTimersByTime(1);
  }

  describe('feed events', () => {
    it('should handle a song', async () => {
      await createMode();
      mode.start();
      vi.advanceTimersByTime(0);

      expect(musicEmitter.emitAudio).toHaveBeenCalledWith('change_track', [
        { title: 'Song A', artists: ['A1', 'A2'], cover: '/cover.png' },
      ]);
      const song = beatManager.active.get('centurion');
      expect(song?.priority).toBe(BeatPriorities.CENTURION_BEAT_GENERATOR);
      expect(song?.generator.bpm).toBe(140);
      expect(screenHandler.changeColors).toHaveBeenCalledWith([
        expect.anything(),
        expect.anything(),
      ]);
      expect(mode.state.lastSongEvent).toMatchObject({ timestamp: 0, type: 'song' });
    });

    it('should strobe all fixtures and the screen on a horn', async () => {
      await createMode();
      playUntil(10);

      [...parGroup.pars, ...headGroup.movingHeadRgbs, ...headGroup.movingHeadWheels].forEach((p) =>
        expect(p.fixture.enableStrobe).toHaveBeenCalledWith(1500),
      );
      expect(screenHandler.horn).toHaveBeenCalledWith(1500, 1);
      expect(mode.state.lastHornEvent).toMatchObject({ timestamp: 10, data: { counter: 1 } });
    });

    it('should enable the disco ball once per effect', async () => {
      await createMode();
      playUntil(20);

      expect(switchManager.enableSwitch).toHaveBeenCalledTimes(1);
      expect(switchManager.enableSwitch).toHaveBeenCalledWith(discoBallSwitch);
    });

    it('should keep the disco ball on during a random effect', async () => {
      tape.feed = [
        {
          timestamp: 5,
          type: 'effect',
          data: {
            discoBall: true,
            effects: {
              pars: [],
              movingHeadRgbColor: [],
              movingHeadRgbMovement: [],
              movingHeadWheelColor: [],
              movingHeadWheelMovement: [],
            },
          },
        },
        { timestamp: 10, type: 'effect', data: { random: true, effects: {} } },
      ];
      await createMode();
      playUntil(10);

      expect(screenHandler.changeColors).toHaveBeenCalledTimes(1);
      expect(switchManager.disableSwitch).not.toHaveBeenCalled();
    });

    it('should fall back to random effects without a disco ball', async () => {
      state.discoballIds = [];
      await createMode();
      playUntil(20);

      expect(switchManager.enableSwitch).not.toHaveBeenCalled();
      expect(screenHandler.changeColors).toHaveBeenCalled();
    });

    it('should not modify the tape without a disco ball', async () => {
      state.discoballIds = [];
      await createMode();
      playUntil(20);

      expect(tape.feed[2]).not.toHaveProperty('data.random');
    });

    it('should remove the song beat generator for a song without bpm', async () => {
      await createMode();
      playUntil(25);

      expect(beatManager.remove).toHaveBeenCalledWith('centurion');
      expect(beatManager.add).not.toHaveBeenCalled();
      expect(beatManager.active.has('centurion')).toBe(false);
    });

    it('should set the song beat generator on a bpm event', async () => {
      await createMode();
      playUntil(30);

      expect(beatManager.active.get('centurion')?.generator.bpm).toBe(160);
    });

    it('should route each effect slot to its fixture type', async () => {
      await createMode();
      playUntil(40);

      expect(lightsHandler.setColorEffect).toHaveBeenCalledTimes(3);
      expect(lightsHandler.setColorEffect).toHaveBeenCalledWith(parGroup, effectBuilders.pars);
      expect(lightsHandler.setColorEffect).toHaveBeenCalledWith(
        headGroup,
        effectBuilders.movingHeadRgbColor,
      );
      expect(lightsHandler.setColorEffect).toHaveBeenCalledWith(
        headGroup,
        effectBuilders.movingHeadWheelColor,
      );
      expect(lightsHandler.setMovementEffect).toHaveBeenCalledTimes(2);
      expect(lightsHandler.setMovementEffect).toHaveBeenCalledWith(
        headGroup,
        effectBuilders.movingHeadRgbMovement,
      );
      expect(lightsHandler.setMovementEffect).toHaveBeenCalledWith(
        headGroup,
        effectBuilders.movingHeadWheelMovement,
      );
      expect(switchManager.disableSwitch).toHaveBeenCalledWith(discoBallSwitch);
    });

    it('should re-roll effects and restart beat generators once on a random effect', async () => {
      await createMode();
      playUntil(50);

      expect(screenHandler.changeColors).toHaveBeenCalledTimes(1);
      expect(beatManager.active.get('background')?.generator.restart).toHaveBeenCalledTimes(1);
      expect(beatManager.active.get('centurion')?.generator.restart).toHaveBeenCalledTimes(1);
    });

    it('should remove all effects on a reset effect', async () => {
      await createMode();
      playUntil(60);

      [parGroup, headGroup].forEach((group) => {
        expect(lightsHandler.removeColorEffect).toHaveBeenCalledWith(group);
        expect(lightsHandler.removeMovementEffect).toHaveBeenCalledWith(group);
      });
    });

    it('should stop at the end of the tape', async () => {
      await createMode();
      playUntil(70);

      expect(audioHandler.stop).toHaveBeenCalled();
      expect(screenHandler.stop).toHaveBeenCalled();
      expect(beatManager.remove).toHaveBeenCalledWith('centurion');
      expect(beatManager.remove).toHaveBeenCalledWith('background');
      expect(beatManager.active.size).toBe(0);
    });
  });

  describe('seek', () => {
    it('should enable the disco ball when starting inside the disco window', async () => {
      await createMode();
      mode.skip(27);
      mode.start();

      expect(switchManager.enableSwitch).toHaveBeenCalledWith(discoBallSwitch);
    });

    it('should restore the song bpm when starting after an effect', async () => {
      await createMode();
      mode.skip(22);
      mode.start();

      expect(beatManager.active.get('centurion')?.generator.bpm).toBe(140);
    });

    it('should restore the bpm event when starting after it', async () => {
      await createMode();
      mode.skip(35);
      mode.start();

      expect(beatManager.active.get('centurion')?.generator.bpm).toBe(160);
    });

    it('should restore the last horn when starting after it', async () => {
      await createMode();
      mode.skip(15);
      mode.start();

      expect(mode.state.lastHornEvent?.data.counter).toBe(1);
      expect(screenHandler.hornCount).toHaveBeenCalledWith(1);
      expect(screenHandler.horn).not.toHaveBeenCalled();
    });

    it('should handle the first song once when starting at 0', async () => {
      await createMode();
      mode.start();
      vi.advanceTimersByTime(0);

      expect(musicEmitter.emitAudio).toHaveBeenCalledTimes(1);
    });

    it('should restart from 0 when starting after the tape has ended', async () => {
      await createMode();
      playUntil(70);
      mode.start();

      expect(audioHandler.play).toHaveBeenLastCalledWith('/static/audio/tape.mp3', 0);
      expect(mode.state.lastSongEvent).toMatchObject({ timestamp: 0 });
      expect(mode.playing).toBe(true);
    });

    it('should ignore a start while already playing', async () => {
      await createMode();
      mode.start();
      vi.advanceTimersByTime(15_000);
      mode.start();
      vi.advanceTimersByTime(10_000);

      expect(audioHandler.play).toHaveBeenCalledOnce();
      expect(screenHandler.horn).toHaveBeenCalledOnce();
    });

    it('should clear the horn when seeking back before the first horn', async () => {
      await createMode();
      playUntil(15);
      mode.skip(5);

      expect(mode.state.lastHornEvent).toBeUndefined();
      expect(screenHandler.hornCount).toHaveBeenCalledWith(null);
    });

    it('should remove the light effects when seeking back before the first song', async () => {
      tape.feed = [
        { timestamp: 5, type: 'song', data: { artist: 'A', title: 'Song A', bpm: 140 } },
      ];
      await createMode();
      playUntil(10);
      mode.skip(2);

      expect(lightsHandler.removeColorEffect).toHaveBeenCalledWith(parGroup);
      expect(lightsHandler.removeColorEffect).toHaveBeenCalledWith(headGroup);
      expect(lightsHandler.removeMovementEffect).toHaveBeenCalledOnce();
      expect(lightsHandler.removeMovementEffect).toHaveBeenCalledWith(headGroup);
    });

    it('should clear the song and screen colours when seeking back before the first song', async () => {
      tape.feed = [
        { timestamp: 5, type: 'song', data: { artist: 'A', title: 'Song A', bpm: 140 } },
      ];
      await createMode();
      playUntil(10);
      mode.skip(2);

      expect(mode.state.lastSongEvent).toBeUndefined();
      expect(mode.state.screenColors).toBeUndefined();
    });

    it('should keep the light effects of their owners when seeking', async () => {
      await createMode();
      playUntil(45);
      mode.skip(42);

      expect(lightsHandler.removeColorEffect).not.toHaveBeenCalled();
      expect(lightsHandler.removeMovementEffect).not.toHaveBeenCalled();
    });

    it.each([
      ['before', 10, 20],
      ['after', 20, 10],
    ])(
      'should roll with the bpm at t when the bpm event comes %s the random effect',
      async (_, bpmAt, randomAt) => {
        tape.feed = [
          { timestamp: 0, type: 'song', data: { artist: 'A', title: 'Song A', bpm: 140 } },
          { timestamp: bpmAt, type: 'bpm', data: { bpm: 160 } },
          { timestamp: randomAt, type: 'effect', data: { random: true, effects: {} } },
        ];
        tape.feed.sort((a, b) => a.timestamp - b.timestamp);
        headGroup.groupInMiddle = false;
        const build = vi.spyOn(TableRotate, 'build');
        await createMode();
        mode.skip(25);
        mode.start();

        // Side movement cycle time is 1 200 000 / bpm
        expect(build).toHaveBeenCalledOnce();
        expect(build).toHaveBeenCalledWith({ cycleTime: 7500 });
      },
    );
  });

  describe('sync', () => {
    // The player stamps its audio position (ms) with its own clock, here equal to the core's
    async function createSyncedMode() {
      await createMode();
      const handler = audioHandler.addSyncAudioTimingHandler.mock.calls[0][0];
      return (seconds: number) => handler({ startTime: Date.now(), timestamp: seconds * 1000 });
    }

    it('should not fire a command twice when the core is ahead', async () => {
      const sync = await createSyncedMode();
      mode.start();
      vi.advanceTimersByTime(10_500);
      sync(10);
      vi.advanceTimersByTime(2000);

      expect(screenHandler.horn).toHaveBeenCalledTimes(1);
    });

    it('should fire skipped commands when the core is behind', async () => {
      const sync = await createSyncedMode();
      mode.start();
      vi.advanceTimersByTime(9500);
      expect(screenHandler.horn).not.toHaveBeenCalled();

      sync(10.2);
      vi.advanceTimersByTime(0);

      expect(screenHandler.horn).toHaveBeenCalledWith(1500, 1);
    });

    it('should restore the lanes when the drift exceeds the threshold', async () => {
      const sync = await createSyncedMode();
      mode.start();
      vi.advanceTimersByTime(5000);
      sync(27);

      expect(switchManager.enableSwitch).toHaveBeenCalledWith(discoBallSwitch);
      expect(screenHandler.hornCount).toHaveBeenCalledWith(1);
      expect(screenHandler.horn).not.toHaveBeenCalled();
      expect(mode.state.lastSongEvent).toMatchObject({ timestamp: 25 });
    });

    it('should catch up on every due command when a timer fires late', async () => {
      await createMode();
      mode.start();
      // The clock moves on while the event loop is blocked
      vi.setSystemTime(Date.now() + 15_000);
      vi.advanceTimersByTime(10_000);

      expect(screenHandler.horn).toHaveBeenCalledTimes(1);
      expect(switchManager.enableSwitch).toHaveBeenCalledWith(discoBallSwitch);
      expect(mode.state.lastSongEvent).toMatchObject({ timestamp: 25 });
    });
  });

  describe('lifecycle', () => {
    it('should not throw when destroyed before starting', async () => {
      await createMode();

      expect(() => mode.destroy()).not.toThrow();
    });

    it('should remove its audio sync handler when destroyed', async () => {
      await createMode();
      mode.destroy();

      expect(audioHandler.syncHandlers).toEqual([]);
    });

    it('should notify the backoffice when playback starts and when the tape ends', async () => {
      const update = vi.fn();
      const { backofficeSyncEmitter } = EmitterStore.getInstance();
      // BackofficeSyncEmitter sends every event as '*' with the event name first
      backofficeSyncEmitter.on('*', update);
      await createMode();

      mode.start();
      expect(update.mock.calls).toEqual([['mode_centurion_update']]);
      vi.advanceTimersByTime(70_000);
      expect(update.mock.calls).toEqual([['mode_centurion_update'], ['mode_centurion_update']]);

      backofficeSyncEmitter.removeListener('*', update);
    });

    it.each([70, 80])('should stop when skipping to %ss while playing', async (seconds) => {
      await createMode();
      mode.start();
      mode.skip(seconds);

      expect(audioHandler.stop).toHaveBeenCalled();
      expect(screenHandler.stop).toHaveBeenCalled();
      expect(beatManager.generators).toEqual([]);
      expect(mode.playing).toBe(false);
    });
  });
});
