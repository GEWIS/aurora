import { registerSettingsDefaults } from '../../server-settings/server-setting';

export interface ScreenHandlerSettings {
  RoomResponsibleLegacyScreenURL: string;
}

declare module '../../server-settings/server-setting' {
  interface ISettings extends ScreenHandlerSettings {}
}

export const ScreenHandlerSettingsDefaults: ScreenHandlerSettings = {
  RoomResponsibleLegacyScreenURL: '',
};

registerSettingsDefaults(ScreenHandlerSettingsDefaults);
