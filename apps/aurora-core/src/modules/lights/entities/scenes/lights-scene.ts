import { Column, Entity, OneToMany } from 'typeorm';
import BaseEntity from '../../../root/entities/base-entity';
// eslint-disable-next-line import/no-cycle -- cross reference
import LightsSceneEffect from './lights-scene-effect';

@Entity()
export default class LightsScene extends BaseEntity {
  @Column()
  public name: string;

  @OneToMany(() => LightsSceneEffect, (e) => e.scene, { eager: true })
  public effects: LightsSceneEffect[];

  @Column()
  public favorite: boolean;
}
