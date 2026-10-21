import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import RandomEffectPicker from './random-effect-picker';
import { CenturionContext } from './centurion-context';
import { LightsGroup } from '../../lights/entities';
import { RgbColor } from '../../lights/color-definitions';

describe('RandomEffectPicker', () => {
  const group = (id: number, fixtures: Record<string, object[]>) =>
    ({
      id,
      groupInMiddle: false,
      pars: [],
      movingHeadRgbs: [],
      movingHeadWheels: [],
      ...fixtures,
    }) as unknown as LightsGroup;

  const parGroup = group(1, { pars: [{}] });
  const rgbGroup = group(2, { movingHeadRgbs: [{}] });
  const wheelGroup = group(3, { movingHeadWheels: [{}] });

  let ctx: CenturionContext;
  let setColorEffect: Mock;
  let setMovementEffect: Mock;

  beforeEach(() => {
    setColorEffect = vi.fn();
    setMovementEffect = vi.fn();
    ctx = {
      lightsHandler: {
        entities: [parGroup, rgbGroup, wheelGroup],
        setColorEffect,
        setMovementEffect,
      },
      beatController: { songBpm: 140 },
    } as unknown as CenturionContext;
  });

  describe('apply', () => {
    const colors = [RgbColor.RED, RgbColor.BLUE];

    it('should only colour the groups with pars for the par colour lane', () => {
      new RandomEffectPicker().apply(ctx, colors, new Set(['parColor']));

      expect(setColorEffect).toHaveBeenCalledOnce();
      expect(setColorEffect).toHaveBeenCalledWith(parGroup, [expect.any(Function)]);
      expect(setMovementEffect).not.toHaveBeenCalled();
    });

    it('should only touch the groups with wheel heads for the wheel lanes', () => {
      new RandomEffectPicker().apply(ctx, colors, new Set(['wheelColor', 'wheelMovement']));

      expect(setColorEffect).toHaveBeenCalledOnce();
      expect(setColorEffect).toHaveBeenCalledWith(wheelGroup, [expect.any(Function)]);
      expect(setMovementEffect).toHaveBeenCalledOnce();
      expect(setMovementEffect).toHaveBeenCalledWith(wheelGroup, [expect.any(Function)]);
    });
  });
});
