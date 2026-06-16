import { Entity, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { LightsGroup, LightsSwitch } from '../../lights/entities';
import SubscribeEntity from './subscribe-entity';

@Entity()
export default class LightsController extends SubscribeEntity {
  @OneToMany(() => LightsGroup, (group) => group.controller)
  public lightsGroups: LightsGroup[];

  @OneToMany(() => LightsSwitch, (lightsSwitch) => lightsSwitch.controller)
  public lightsSwitches: LightsSwitch[];
}
