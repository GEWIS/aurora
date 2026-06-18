import { LightsSwitch } from '../lights/entities';

export default class LightsSwitchManager {
  private static instance: LightsSwitchManager;

  private enabledSwitches: LightsSwitch[] = [];

  private constructor() {}

  public static getInstance(): LightsSwitchManager {
    if (this.instance == null) {
      this.instance = new LightsSwitchManager();
    }
    return this.instance;
  }

  /**
   * Turn on the given switch if it is turned off
   * @param lightsSwitch
   */
  public enableSwitch(lightsSwitch: LightsSwitch): void {
    const index = this.enabledSwitches.findIndex((s) => s.id === lightsSwitch.id);
    // Switch is already turned on
    if (index >= 0) return;

    this.enabledSwitches.push(lightsSwitch);
  }

  /**
   * Turn off the given switch if it is turned on
   * @param lightsSwitch
   */
  public disableSwitch(lightsSwitch: LightsSwitch) {
    const index = this.enabledSwitches.findIndex((s) => s.id === lightsSwitch.id);
    if (index >= 0) {
      // Remove the switch from the list if it is turned on
      this.enabledSwitches.splice(index, 1);
    }
  }

  /**
   * Get all lights switches that are turned on
   */
  public getEnabledSwitches(): LightsSwitch[] {
    return this.enabledSwitches;
  }

  /**
   * Returns whether the given switch is enabled or disabled
   * @param lightsSwitch
   */
  public switchEnabled(lightsSwitch: LightsSwitch): boolean {
    return this.enabledSwitches.some((s) => s.id === lightsSwitch.id);
  }
}
