import { describe, it, expect, vi } from 'vitest';
import EffectCommand from './effect-command';
import { EffectData } from '../../../lights/mix-tape';
import { LightsEffectBuilder } from '../../../lights/effects/lights-effect';
import { Lane } from '../centurion-context';

const builder = vi.fn() as unknown as LightsEffectBuilder;

const lights: Lane[] = ['parColor', 'rgbColor', 'rgbMovement', 'wheelColor', 'wheelMovement'];

const discoOnly: EffectData = {
  discoBall: true,
  effects: {
    pars: [],
    movingHeadRgbColor: [],
    movingHeadRgbMovement: [],
    movingHeadWheelColor: [],
    movingHeadWheelMovement: [],
  },
};

describe('EffectCommand', () => {
  describe('lanes', () => {
    it.each<[string, EffectData, boolean, Lane[]]>([
      [
        'an explicit effect claims the slots it sets, empty ones included, and the disco ball',
        { effects: { pars: [builder], movingHeadWheelColor: [] } },
        true,
        ['parColor', 'wheelColor', 'discoBall'],
      ],
      [
        'a reset claims every light slot and the disco ball',
        { reset: true, effects: {} },
        true,
        [...lights, 'discoBall'],
      ],
      [
        'a random effect claims every light slot and the screen colours, not the disco ball',
        { random: true, effects: {} },
        true,
        [...lights, 'screenColors'],
      ],
      [
        'a random effect that sets the disco ball also claims it',
        { random: true, discoBall: false, effects: {} },
        true,
        [...lights, 'screenColors', 'discoBall'],
      ],
      [
        'a disco-only effect with a disco ball claims its empty slots and the disco ball',
        discoOnly,
        true,
        [...lights, 'discoBall'],
      ],
      [
        'a disco-only effect without a disco ball falls back to a random roll',
        discoOnly,
        false,
        [...lights, 'screenColors', 'discoBall'],
      ],
    ])('%s', (_, data, hasDiscoball, expected) => {
      const command = new EffectCommand({ timestamp: 0, type: 'effect', data }, hasDiscoball);

      expect([...command.lanes].sort()).toEqual([...expected].sort());
    });
  });
});
