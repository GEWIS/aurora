import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseEntity from '../../../root/entities/base-entity';
// eslint-disable-next-line import/no-cycle
import LightsScene from './lights-scene';
// eslint-disable-next-line import/no-cycle
import LightsGroup from '../lights-group';

@Entity()
export default class LightsSceneEffect extends BaseEntity {
  @Column()
  public sceneId: number;

  @ManyToOne(() => LightsScene)
  @JoinColumn({ name: 'sceneId' })
  public scene: LightsScene;

  /**
   * Name of the effect that should be assigned to this lights group
   */
  @Column()
  public effectName: string;

  /**
   * Props of the given effect
   */
  @Column()
  public effectProps: string;

  @Column()
  public groupId: number;

  @ManyToOne(() => LightsGroup, { eager: true })
  @JoinColumn({ name: 'groupId' })
  public group: LightsGroup;
}
