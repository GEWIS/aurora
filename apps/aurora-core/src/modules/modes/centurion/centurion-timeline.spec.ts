import { describe, it, expect, vi } from 'vitest';
import CenturionTimeline from './centurion-timeline';
import tapes, { validateTape } from './tapes';
import gebroedersScooterTotaleEscalatien from './tapes/gebroeders-scooter-totale-escalatien';
import { CenturionCommand } from './commands/centurion-command';
import SongCommand from './commands/song-command';
import HornCommand from './commands/horn-command';
import BpmCommand from './commands/bpm-command';
import EffectCommand from './commands/effect-command';
import StopCommand from './commands/stop-command';
import { LightsEffectBuilder } from '../../lights/effects/lights-effect';

const builder = vi.fn() as unknown as LightsEffectBuilder;

const song = (timestamp: number, bpm?: number) =>
  new SongCommand({ timestamp, type: 'song', data: { artist: 'Artist', title: 'Title', bpm } });
const horn = (timestamp: number, counter: number) =>
  new HornCommand({ timestamp, type: 'horn', data: { counter } });
const tempo = (timestamp: number, bpm: number) =>
  new BpmCommand({ timestamp, type: 'bpm', data: { bpm } });
const parsEffect = (timestamp: number) =>
  new EffectCommand({ timestamp, type: 'effect', data: { effects: { pars: [builder] } } }, true);

const songOwns = {
  song: 'song',
  bpm: 'song',
  screenColors: 'song',
  parColor: 'song',
  rgbColor: 'song',
  rgbMovement: 'song',
  wheelColor: 'song',
  wheelMovement: 'song',
};

/** The owners at t, as the labels of the given commands, which are in tape order */
function ownerLabels(commands: Record<string, CenturionCommand>, t: number) {
  const labels = new Map(Object.entries(commands).map(([label, cmd]) => [cmd, label]));
  const timeline = new CenturionTimeline(Object.values(commands));
  return Object.fromEntries(
    [...timeline.ownersAt(t)].map(([lane, cmd]) => [lane, labels.get(cmd)]),
  );
}

describe('CenturionTimeline', () => {
  describe('ownersAt', () => {
    it('should keep the moving heads with the song after a pars-only effect', () => {
      expect(ownerLabels({ horn: horn(5, 1), song: song(10), pars: parsEffect(20) }, 30)).toEqual({
        ...songOwns,
        horn: 'horn',
        parColor: 'pars',
        discoBall: 'pars',
      });
    });

    it('should give bpm to a bpm event during a song', () => {
      expect(ownerLabels({ song: song(10, 140), tempo: tempo(20, 160) }, 25)).toEqual({
        ...songOwns,
        bpm: 'tempo',
      });
    });

    it('should give the horn to the later of two horns at the same timestamp', () => {
      expect(ownerLabels({ first: horn(10, 1), second: horn(10, 2) }, 10)).toEqual({
        horn: 'second',
      });
    });

    it('should include a command at exactly t', () => {
      expect(ownerLabels({ song: song(0) }, 0)).toEqual(songOwns);
    });

    it('should return no owners before the first command', () => {
      expect(ownerLabels({ song: song(1) }, 0)).toEqual({});
    });

    it('should keep the owners at the stop', () => {
      expect(ownerLabels({ song: song(10), stop: new StopCommand(100) }, 100)).toEqual(songOwns);
    });
  });

  describe('indexAfter', () => {
    it('should point at the first command after t', () => {
      const timeline = new CenturionTimeline([song(0), horn(10, 1), horn(10, 2), song(25)]);

      expect(timeline.indexAfter(-1)).toBe(0);
      expect(timeline.indexAfter(0)).toBe(1);
      expect(timeline.indexAfter(10)).toBe(3);
      expect(timeline.indexAfter(12)).toBe(3);
      expect(timeline.indexAfter(25)).toBe(4);
    });
  });

  describe('fromMixTape', () => {
    it.each(tapes.map((tape) => [tape.name, tape] as const))(
      'should build "%s" with the stop after every event',
      (_, tape) => {
        validateTape(tape);
        [true, false].forEach((hasDiscoball) => {
          const timeline = CenturionTimeline.fromMixTape(tape, hasDiscoball);
          expect(timeline.indexAfter(tape.duration)).toBe(tape.feed.length + 1);
        });
      },
    );

    it('should follow the disco ball window in Totale Escalatie', () => {
      const tape = gebroedersScooterTotaleEscalatien;

      // Disco ball on at 2650.5, off at 2716
      const withBall = CenturionTimeline.fromMixTape(tape, true).ownersAt(2700);
      expect(withBall.get('discoBall')!.startTime).toBe(2650.5);
      expect(withBall.get('screenColors')).toBe(withBall.get('song'));

      // Without a ball, the disco-only effect becomes a random roll
      const withoutBall = CenturionTimeline.fromMixTape(tape, false).ownersAt(2700);
      expect(withoutBall.get('screenColors')).toBe(withoutBall.get('discoBall'));

      const after = CenturionTimeline.fromMixTape(tape, true).ownersAt(2720);
      expect(after.get('discoBall')!.startTime).toBe(2716);
      expect(after.get('discoBall')).not.toBe(after.get('song'));
    });
  });
});
