import { registerSettingsDefaults } from '../../../server-settings/server-setting';

export interface InfoScreenSettings {
  /**
   * Whether the info screen handler should be enabled.
   */
  InfoScreen: boolean;
}

declare module '../../../server-settings/server-setting' {
  interface ISettings extends InfoScreenSettings {}
}

export const InfoScreenSettingsDefaults: InfoScreenSettings = {
  InfoScreen: true,
};

registerSettingsDefaults(InfoScreenSettingsDefaults);
