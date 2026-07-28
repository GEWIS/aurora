import { Entity, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import LightsGroup from './lights-group';
import LightsSwitch from './lights-switch';
import SubscribeEntity from '../../root/entities/subscribe-entity';

@Entity()
export default class LightsController extends SubscribeEntity {
  @OneToMany(() => LightsGroup, (group) => group.controller)
  public lightsGroups: LightsGroup[];

  @OneToMany(() => LightsSwitch, (lightsSwitch) => lightsSwitch.controller)
  public lightsSwitches: LightsSwitch[];
}
