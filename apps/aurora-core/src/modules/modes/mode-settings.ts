import { registerSettingsDefaults } from '../server-settings/server-setting';

export interface ModeSettings {
  /**
   * Whether Centurion Mode should be available/present.
   */
  Centurion: boolean;

  /**
   * IDs of all light switches that should be activated when a discoball
   * should be turned on.
   */
  'Centurion.DiscoballLightsSwitchIds': number[];

  /**
   * Whether Time Trail Race (Spoelbakkenrace) should be available/present.
   */
  TimeTrailRace: boolean;
}

declare module '../server-settings/server-setting' {
  interface ISettings extends ModeSettings {}
}

export const ModeSettingsDefaults: ModeSettings = {
  Centurion: true,
  'Centurion.DiscoballLightsSwitchIds': [],
  TimeTrailRace: true,
};

registerSettingsDefaults(ModeSettingsDefaults);
