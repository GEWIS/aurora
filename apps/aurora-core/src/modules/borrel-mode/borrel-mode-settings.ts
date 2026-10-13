import { registerSettingsDefaults } from '../server-settings/server-setting';

export interface BorrelModeSettings {
  /**
   * Whether "borrel mode" is present, namely a toggle that adds an extra set of
   * posters to the rotation and changes the info screen during a borrel.
   */
  BorrelModePresent: boolean;
}

declare module '../server-settings/server-setting' {
  interface ISettings extends BorrelModeSettings {}
}

export const BorrelModeSettingsDefault: BorrelModeSettings = {
  BorrelModePresent: true,
};

registerSettingsDefaults(BorrelModeSettingsDefault);
