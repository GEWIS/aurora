import { Column, Entity } from 'typeorm';
import BaseEntity from '../root/entities/base-entity';
import { jsonTransformer } from '../../helpers/transformers';
import type {} from '../../register-settings';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISettings {}

const settingsDefaults: Partial<ISettings> = {};

export function registerSettingsDefaults<T extends Partial<ISettings>>(defaults: T): void {
  Object.assign(settingsDefaults, defaults);
}

export function getSettingsDefaults(): ISettings {
  return settingsDefaults as ISettings;
}

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
