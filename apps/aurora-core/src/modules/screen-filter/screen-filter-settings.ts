import { registerSettingsDefaults } from '../server-settings/server-setting';

export interface ScreenFilterSettings {
  ScreenFilter: boolean;
  'ScreenFilter.Brightness': number;
  'ScreenFilter.Warmth': number;
}

declare module '../server-settings/server-setting' {
  interface ISettings extends ScreenFilterSettings {}
}

export const ScreenFilterSettingsDefault: ScreenFilterSettings = {
  ScreenFilter: true,
  'ScreenFilter.Brightness': 100,
  'ScreenFilter.Warmth': 0,
};

registerSettingsDefaults(ScreenFilterSettingsDefault);
