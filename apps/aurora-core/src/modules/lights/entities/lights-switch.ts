import BaseEntity from '../../root/entities/base-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import LightsController from '../../root/entities/lights-controller';

@Entity()
export default class LightsSwitch extends BaseEntity {
  @ManyToOne(() => LightsController, { eager: true })
  @JoinColumn()
  public controller: LightsController;

  /**
   * DMX channel this lights switch is on
   */
  @Column({ type: 'tinyint', unsigned: true })
  public dmxChannel: number;

  /**
   * DMX value to send to the channel to turn on the switch
   */
  @Column({ type: 'tinyint', unsigned: true })
  public onValue: number;

  @Column()
  public name: string;
}
