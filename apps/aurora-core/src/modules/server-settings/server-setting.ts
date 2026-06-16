import { Column, Entity } from 'typeorm';
import BaseEntity from '../root/entities/base-entity';
import { SudoSOSSettings, SudoSOSSettingsDefault } from '../sudosos/sudosos-settings';
import { ModeSettings, ModeSettingsDefaults } from '../modes/mode-settings';
import {
  ScreenHandlerSettings,
  ScreenHandlerSettingsDefaults,
} from '../handlers/screen/screen-handler-settings';
import { OrderSettings, OrderSettingsDefault } from '../orders/order-settings';
import {
  PosterScreenHandlerSettings,
  PosterScreenHandlerSettingsDefaults,
} from '../handlers/screen/poster/poster-screen-handler-settings';
import { jsonTransformer } from '../../helpers/transformers';

export interface ISettings
  extends
    SudoSOSSettings,
    ModeSettings,
    ScreenHandlerSettings,
    PosterScreenHandlerSettings,
    OrderSettings {}

export const SettingsDefaults: ISettings = {
  ...SudoSOSSettingsDefault,
  ...ModeSettingsDefaults,
  ...ScreenHandlerSettingsDefaults,
  ...PosterScreenHandlerSettingsDefaults,
  ...OrderSettingsDefault,
};

/**
 * Key-value store
 */
@Entity()
export default class ServerSetting<T extends keyof ISettings = keyof ISettings> extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  public key: T;

  /**
   * JSON-stored value
   */
  @Column({
    type: 'varchar',
    transformer: jsonTransformer(),
  })
  public value: ISettings[T];
}
