import { Column, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle -- cross reference
import LightsMovingHeadWheel from './lights-moving-head-wheel';
import BaseEntity from '../../root/entities/base-entity';

export default class LightsWheelChannelValue<T> extends BaseEntity {
  @ManyToOne(() => LightsMovingHeadWheel)
  @JoinColumn()
  public movingHead: LightsMovingHeadWheel;

  @Column({ type: 'varchar' })
  public name: T;

  @Column({ type: 'smallint', unsigned: true })
  public value: number;
}
