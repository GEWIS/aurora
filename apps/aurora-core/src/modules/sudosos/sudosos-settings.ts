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

export const SudoSOSSettingsDefault: SudoSOSSettings = {
  SudoSOS: true,
  'SudoSOS.BorrelmodePOSID': -1,
  'SudoSOS.BACGroupID': -1,
};
