import BaseEntity from '../../../root/entities/base-entity';
import { Column, Entity } from 'typeorm';
import { LightsEffectsColorCreateParams } from '../../effects/color';
import { LightsEffectsMovementCreateParams } from '../../effects/movement';
import { RgbColor } from '../../color-definitions';
import { jsonTransformer } from '../../../../helpers/transformers';

export type LightsButtonColors = {
  type: 'LightsButtonColors';
  colors: RgbColor[];
  /**
   * Lights groups to which these colors should be immediately applied to
   */
  lightsGroupIds?: number[];
};

export type LightsButtonEffectColor = {
  type: 'LightsButtonEffectColor';
  effectProps: LightsEffectsColorCreateParams;
  lightsGroupIds: number[];
};

export type LightsButtonEffectMovement = {
  type: 'LightsButtonEffectMovement';
  effectProps: LightsEffectsMovementCreateParams;
  lightsGroupIds: number[];
};

export type LightsButtonReset = {
  type: 'LightsButtonReset';
  lightsGroupIds: number[];
};

export type LightsButtonSwitch = {
  type: 'LightsButtonSwitch';
  switchIds: number[];
};

export type LightsButtonStrobe = {
  type: 'LightsButtonStrobe';
  lightsGroupIds: number[];
};

export type LightsButtonNull = {
  type: 'LightsButtonNull';
};

export type LightsPredefinedEffectProperties =
  | LightsButtonColors
  | LightsButtonEffectColor
  | LightsButtonEffectMovement
  | LightsButtonReset
  | LightsButtonSwitch
  | LightsButtonStrobe
  | LightsButtonNull;

/**
 * Button on the effect controller board, applying an effect, color, or switch
 */
@Entity()
export default class LightsPredefinedEffect extends BaseEntity {
  @Column({ type: 'int', unsigned: true, unique: true })
  buttonId: number;

  @Column({
    type: 'varchar',
    transformer: jsonTransformer<LightsPredefinedEffectProperties>(),
  })
  properties: LightsPredefinedEffectProperties;

  @Column({ nullable: true, type: 'varchar' })
  icon?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  name?: string | null;
}
