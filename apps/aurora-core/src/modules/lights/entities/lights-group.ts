import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { LightsController } from '../../root/entities';
// eslint-disable-next-line import/no-cycle
import LightsGroupPars from './lights-group-pars';
// eslint-disable-next-line import/no-cycle
import LightsGroupMovingHeadWheels from './lights-group-moving-head-wheels';
// eslint-disable-next-line import/no-cycle
import LightsGroupMovingHeadRgbs from './lights-group-moving-head-rgbs';
import SubscribeEntity from '../../root/entities/subscribe-entity';

@Entity()
export default class LightsGroup extends SubscribeEntity {
  @ManyToOne(() => LightsController, { eager: true })
  @JoinColumn()
  public controller: LightsController;

  @OneToMany(() => LightsGroupPars, (pars) => pars.group, { eager: true })
  public pars: LightsGroupPars[];

  @OneToMany(() => LightsGroupMovingHeadWheels, (pars) => pars.group, { eager: true })
  public movingHeadWheels: LightsGroupMovingHeadWheels[];

  @OneToMany(() => LightsGroupMovingHeadRgbs, (pars) => pars.group, { eager: true })
  public movingHeadRgbs: LightsGroupMovingHeadRgbs[];

  /**
   * Whether the group of lights is situated in the middle of the room, or at the side.
   * Handlers can use this to determine which effects to use.
   */
  @Column({ default: true })
  public groupInMiddle: boolean;

  /**
   * Size (width) of the X axis where all the fixtures are positioned.
   * All fixtures should have their positionX be in range [0, gridSizeX).
   */
  @Column({ type: 'real', unsigned: true, nullable: false })
  public gridSizeX: number;

  /**
   * Size (width) of the Y axis where all the fixtures are positioned.
   * 0 if the lights are positioned in a line (and not in a grid)
   */
  @Column({ type: 'real', unsigned: true, nullable: false, default: 0 })
  public gridSizeY: number;

  public get fixtures(): (
    | LightsGroupPars
    | LightsGroupMovingHeadWheels
    | LightsGroupMovingHeadRgbs
  )[] {
    return [...this.pars, ...this.movingHeadWheels, ...this.movingHeadRgbs];
  }

  public blackout() {
    this.pars.forEach((par) => par.fixture.blackout());
    this.movingHeadWheels.forEach((par) => par.fixture.blackout());
    this.movingHeadRgbs.forEach((par) => par.fixture.blackout());
  }

  /**
   * Enable the strobe on all fixtures in this group
   */
  public enableStrobe(milliseconds?: number) {
    this.pars.forEach((par) => par.fixture.enableStrobe(milliseconds));
    this.movingHeadWheels.forEach((par) => par.fixture.enableStrobe(milliseconds));
    this.movingHeadRgbs.forEach((par) => par.fixture.enableStrobe(milliseconds));
  }

  /**
   * Disable the strobe for all fixtures in this group (if strobe is enabled)
   */
  public disableStrobe() {
    this.pars.forEach((par) => par.fixture.disableStrobe());
    this.movingHeadWheels.forEach((par) => par.fixture.disableStrobe());
    this.movingHeadRgbs.forEach((par) => par.fixture.disableStrobe());
  }
}
