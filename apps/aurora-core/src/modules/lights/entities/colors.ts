import { RgbColor } from '../color-definitions';
import LightsFixtureShutterOptions from './lights-fixture-shutter-options';

export default abstract class Colors {
  protected valuesUpdatedAt = new Date();

  protected currentBrightness: number = 1;

  protected strobe: boolean = false;
  private strobeDisableEvent: NodeJS.Timeout | undefined;

  public abstract setColor(color: RgbColor): void;
  public abstract reset(): void;

  /**
   * Set the relative brightness of the fixture.
   * Should be used by effects.
   * @param brightness Value between [0, 1]
   */
  public setBrightness(brightness: number) {
    this.valuesUpdatedAt = new Date();
    // Set upper and lower bounds to 1 and 0 respectively
    this.currentBrightness = Math.max(0, Math.min(1, brightness));
  }

  /**
   * Start strobing
   * @param milliseconds After how many ms the strobe should automatically
   * be disabled.
   */
  public enableStrobe(milliseconds?: number): void {
    this.valuesUpdatedAt = new Date();
    this.strobe = true;

    // Stop an existing stop strobe timeout if it exists
    if (this.strobeDisableEvent) {
      clearTimeout(this.strobeDisableEvent);
      this.strobeDisableEvent = undefined;
    }

    // Create a stop strobe timeout if a time is given
    if (milliseconds) {
      this.strobeDisableEvent = setTimeout(this.disableStrobe.bind(this), milliseconds);
    }
  }

  /**
   * Stop strobe if strobing
   */
  public disableStrobe(): void {
    this.valuesUpdatedAt = new Date();
    this.strobe = false;

    if (this.strobeDisableEvent) {
      clearTimeout(this.strobeDisableEvent);
      this.strobeDisableEvent = undefined;
    }
  }

  /**
   * Whether strobe is enabled
   */
  public strobeEnabled(): boolean {
    return this.strobe;
  }

  /**
   * When the colors have changed
   */
  public lastUpdate(): Date {
    return this.valuesUpdatedAt;
  }

  /**
   * Apply strobe effect to the given DMX subpacket
   * @param masterRelativeBrightness Value in [0, 1], indicating the master dimmer value
   * @param values DMX subpacket
   * @param shutterOptions Fixture's shutter options
   */
  public abstract setStrobeInDmx(
    masterRelativeBrightness: number,
    values: number[],
    shutterOptions: LightsFixtureShutterOptions[],
  ): number[];

  /**
   * Apply colors to the given DMX subpacket (in-place)
   * @param masterRelativeBrightness Value in [0, 1], indicating the master dimmer value
   * @param values DMX subpacket
   * @param shutterOptions Fixture's shutter options
   */
  public abstract setColorsInDmx(
    masterRelativeBrightness: number,
    values: number[],
    shutterOptions: LightsFixtureShutterOptions[],
  ): number[];
}
