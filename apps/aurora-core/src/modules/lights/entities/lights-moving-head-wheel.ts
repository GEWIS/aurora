import { Column, Entity, OneToMany } from 'typeorm';
import LightsMovingHead from './lights-moving-head';
import { RgbColor } from '../color-definitions';
import LightsMovingHeadWheelShutterOptions from './lights-moving-head-wheel-shutter-options';
import ColorsWheel from './colors-wheel';

@Entity()
export default class LightsMovingHeadWheel extends LightsMovingHead {
  @OneToMany(() => LightsMovingHeadWheelShutterOptions, (opt) => opt.fixture, { eager: true })
  public shutterOptions: LightsMovingHeadWheelShutterOptions[];

  @Column(() => ColorsWheel)
  public wheel: ColorsWheel;

  public lastUpdate(): Date {
    return this.getMaxDate(
      this.valuesUpdatedAt,
      this.wheel.lastUpdate(),
      this.movement.lastUpdate(),
    );
  }

  public setColor(color?: RgbColor) {
    this.wheel.setColor(color);
  }

  public resetColor(): void {
    this.wheel.reset();
  }

  public setGobo(gobo?: string) {
    this.wheel.setGobo(gobo);
  }

  public setGoboRotate(rotate?: string) {
    this.wheel.setGoboRotate(rotate);
  }

  public blackout() {
    super.blackout();
    this.wheel.reset();
  }

  public enableStrobe(milliseconds?: number): void {
    this.wheel.enableStrobe(milliseconds);
  }

  public disableStrobe(): void {
    this.wheel.disableStrobe();
  }

  public setBrightness(brightness: number): void {
    this.wheel.setBrightness(brightness);
  }

  protected strobeEnabled(): boolean {
    return this.wheel.strobeEnabled();
  }

  /**
   * Get the DMX packet for a strobing light
   * @protected
   */
  protected getStrobeDMX(masterRelativeBrightness: number): number[] {
    let values = this.getEmptyDmxSubPacket();

    values = this.wheel.setStrobeInDmx(masterRelativeBrightness, values, this.shutterOptions);
    values = this.setPositionInDmx(values);

    if (!this.wheel.shutterChannel) {
      // The getStrobeInDmx() value changes its state if we need to
      // strobe manually. Because of optimizations, we need to also
      // indicate the state has changed.
      this.valuesUpdatedAt = new Date(new Date().getTime() + 1000);
    }

    return values;
  }

  public getDmxFromCurrentValues(masterRelativeBrightness: number): number[] {
    let values = this.getEmptyDmxSubPacket();

    values = this.wheel.setColorsInDmx(masterRelativeBrightness, values, this.shutterOptions);
    values = this.setPositionInDmx(values);

    return values;
  }
}
