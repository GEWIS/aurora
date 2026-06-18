import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import BaseEntity from '../../../root/entities/base-entity';
// eslint-disable-next-line import/no-cycle -- cross reference
import LightsGroup from '../lights-group';

@Entity()
export class LightsTrackEffect extends BaseEntity {
  /**
   * Either a Spotify Track URI (spotify:track:<id>) or a local identifier (local:<id>)
   */
  @Column()
  public trackUri: string;

  @ManyToMany(() => LightsGroup, { cascade: true })
  @JoinTable()
  public lightGroups: LightsGroup[];

  /**
   * Timestamp within the song at which this effect should become active (in ms)
   */
  @Column()
  public timestamp: number;

  /**
   * Number of ms this effect should stay active
   */
  @Column()
  public duration: number;

  /**
   * Constructor class name of the effect
   */
  @Column()
  public effect: string;

  /**
   * Props of the given effect
   */
  @Column()
  public effectProps: string;
}
