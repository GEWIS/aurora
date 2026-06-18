import { Column } from 'typeorm';
import LightsFixture from './lights-fixture';
import Movement from './movement';

export default abstract class LightsMovingHead extends LightsFixture {
  @Column(() => Movement)
  public movement: Movement;

  /**
   * @param pan value between [0, 1]
   * @param tilt value between [0, 1]
   */
  public setPositionRel(pan: number, tilt: number) {
    this.movement.setPositionRel(pan, tilt);
  }

  /**
   * @param pan value between [0, 255). Any decimals are applied to the finePan
   * @param tilt value between [0, 255). Any decimals are applied to the fineTilt
   * @deprecated
   */
  public setPosition(pan: number, tilt: number) {
    this.movement.setPositionAbs(pan, tilt);
  }

  protected setPositionInDmx(values: number[]): number[] {
    return this.movement.setPositionInDmx(values);
  }

  public blackout(): void {
    super.blackout();
    this.movement.reset();
  }
}
