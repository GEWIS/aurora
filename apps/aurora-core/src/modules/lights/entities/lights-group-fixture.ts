import BaseEntity from '../../root/entities/base-entity';
import { Column } from 'typeorm';

export const DEFAULT_MASTER_DIMMER = 1;

export default abstract class LightsGroupFixture extends BaseEntity {
  @Column({ type: 'real', unsigned: true, nullable: false })
  public positionX: number;

  @Column({ type: 'real', unsigned: true, nullable: false, default: 0 })
  public positionY: number;

  @Column({ type: 'smallint', unsigned: true })
  public firstChannel: number;

  /**
   * Relative brightness of a fixture, applied on top of the relative
   * brightness applied by an effect
   */
  @Column({ type: 'double', default: DEFAULT_MASTER_DIMMER })
  public masterRelativeBrightness: number;

  public getActualChannel(relativeChannel: number) {
    return relativeChannel + this.firstChannel - 1;
  }

  /**
   * Get the current DMX values as an 16-length array of integers.
   */
  public abstract toDmx(): number[];
}
