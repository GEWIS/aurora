import { registerSettingsDefaults } from '../server-settings/server-setting';

export interface SudoSOSSettings {
  SudoSOS: boolean;
  /**
   * @isInt
   */
  'SudoSOS.BorrelmodePOSID': number;
  /**
   * @isInt
   */
  'SudoSOS.BACGroupID': number;
}

declare module '../server-settings/server-setting' {
  interface ISettings extends SudoSOSSettings {}
}

export const SudoSOSSettingsDefault: SudoSOSSettings = {
  SudoSOS: true,
  'SudoSOS.BorrelmodePOSID': -1,
  'SudoSOS.BACGroupID': -1,
};

registerSettingsDefaults(SudoSOSSettingsDefault);
