import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import SongCommand from './song-command';
import RandomEffectPicker from '../random-effect-picker';
import { CenturionContext } from '../centurion-context';

describe('SongCommand', () => {
  const command = new SongCommand({
    timestamp: 25,
    type: 'song',
    data: { artist: 'A1, A2', title: 'Song', bpm: 140 },
  });

  let ctx: CenturionContext;
  let emitAudio: Mock;
  let changeColors: Mock;
  let setSong: Mock;

  beforeEach(() => {
    emitAudio = vi.fn();
    changeColors = vi.fn();
    setSong = vi.fn();
    ctx = {
      state: {},
      musicEmitter: { emitAudio },
      lightsHandler: { entities: [] },
      screenHandler: { changeColors },
      beatController: { setSong, songBpm: undefined },
      randomEffects: new RandomEffectPicker(),
      coverUrl: '/cover.png',
    } as unknown as CenturionContext;
  });

  describe('restore', () => {
    it('should only set the song bpm for the bpm lane', () => {
      command.restore(ctx, new Set(['bpm']));

      expect(setSong).toHaveBeenCalledWith(140);
      expect(emitAudio).not.toHaveBeenCalled();
      expect(changeColors).not.toHaveBeenCalled();
      expect(ctx.state).toEqual({});
    });

    it('should emit the track and send colours without setting the bpm', () => {
      command.restore(ctx, new Set(['song', 'screenColors']));

      expect(emitAudio).toHaveBeenCalledWith('change_track', [
        { title: 'Song', artists: ['A1', 'A2'], cover: '/cover.png' },
      ]);
      expect(changeColors).toHaveBeenCalledWith(ctx.state.screenColors);
      expect(ctx.state.lastSongEvent).toMatchObject({ timestamp: 25 });
      expect(setSong).not.toHaveBeenCalled();
    });
  });
});
