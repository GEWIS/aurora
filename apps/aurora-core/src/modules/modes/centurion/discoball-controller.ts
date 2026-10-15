import { LightsSwitch } from '../../lights/entities';
import LightsSwitchManager from '../../lights/lights-switch-manager';

export default class DiscoballController {
  constructor(
    private readonly discoballs: LightsSwitch[],
    private readonly lightsSwitchManager: LightsSwitchManager,
  ) {}

  public get hasDiscoball(): boolean {
    return this.discoballs.length > 0;
  }

  public enable(): void {
    this.discoballs.forEach((s) => {
      this.lightsSwitchManager.enableSwitch(s);
    });
  }

  public disable(): void {
    this.discoballs.forEach((s) => {
      this.lightsSwitchManager.disableSwitch(s);
    });
  }
}
