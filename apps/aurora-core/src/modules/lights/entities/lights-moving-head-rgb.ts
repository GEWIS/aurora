import { Column, Entity, OneToMany } from 'typeorm';
import LightsMovingHead from './lights-moving-head';
import ColorsRgb, { IColorsRgb } from './colors-rgb';
import { RgbColor } from '../color-definitions';
// eslint-disable-next-line import/no-cycle
import LightsMovingHeadRgbShutterOptions from './lights-moving-head-rgb-shutter-options';

@Entity()
export default class LightsMovingHeadRgb extends LightsMovingHead {
  @OneToMany(() => LightsMovingHeadRgbShutterOptions, (opt) => opt.fixture, { eager: true })
  public shutterOptions: LightsMovingHeadRgbShutterOptions[];

  @Column(() => ColorsRgb)
  public color: ColorsRgb;

  public lastUpdate(): Date {
    return this.getMaxDate(
      this.valuesUpdatedAt,
      this.color.lastUpdate(),
      this.movement.lastUpdate(),
    );
  }

  public setColor(color?: RgbColor) {
    this.color.setColor(color);
  }

  public setCustomColor(color: IColorsRgb) {
    this.color.setCustomColor(color);
  }

  public resetColor() {
    this.color.reset();
  }

  public blackout() {
    super.blackout();
    this.color.reset();
  }

  public enableStrobe(milliseconds?: number): void {
    this.color.enableStrobe(milliseconds);
  }

  public disableStrobe(): void {
    this.color.disableStrobe();
  }

  public setBrightness(brightness: number): void {
    this.color.setBrightness(brightness);
  }

  protected strobeEnabled(): boolean {
    return this.color.strobeEnabled();
  }

  /**
   * Get the DMX packet for a strobing light
   * @protected
   */
  protected getStrobeDMX(masterRelativeBrightness: number): number[] {
    let values = this.getEmptyDmxSubPacket();

    values = this.color.setStrobeInDmx(masterRelativeBrightness, values, this.shutterOptions);
    values = this.setPositionInDmx(values);

    if (!this.color.shutterChannel) {
      // The getStrobeInDmx() value changes its state if we need to
      // strobe manually. Because of optimizations, we need to also
      // indicate the state has changed.
      this.valuesUpdatedAt = new Date(new Date().getTime() + 1000);
    }

    return values;
  }

  public getDmxFromCurrentValues(masterRelativeBrightness: number): number[] {
    let values = this.getEmptyDmxSubPacket();

    values = this.color.setColorsInDmx(masterRelativeBrightness, values, this.shutterOptions);
    values = this.setPositionInDmx(values);

    return values;
  }
}
