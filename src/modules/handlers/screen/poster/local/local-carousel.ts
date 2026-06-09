import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

@Entity()
export default class Carousel extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'simple-array', nullable: true })
  posterOrder?: number[];
}
