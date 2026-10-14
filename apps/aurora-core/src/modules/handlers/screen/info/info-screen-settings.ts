import { registerSettingsDefaults } from '../../../server-settings/server-setting';

export interface InfoScreenSettings {
  /**
   * Whether the info screen handler should be enabled.
   */
  InfoScreen: boolean;
  'InfoScreen.CallerId': boolean;
  'InfoScreen.CallerId.UnknownNumber': 'full' | 'censored' | 'hidden';
}

declare module '../../../server-settings/server-setting' {
  interface ISettings extends InfoScreenSettings {}
}

export const InfoScreenSettingsDefaults: InfoScreenSettings = {
  InfoScreen: true,
  'InfoScreen.CallerId': false,
  'InfoScreen.CallerId.UnknownNumber': 'hidden',
};

registerSettingsDefaults(InfoScreenSettingsDefaults);
