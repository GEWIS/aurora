import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import LightsGroup from './lights-group';
import LightsMovingHeadWheel from './lights-moving-head-wheel';
import LightsGroupFixture from './lights-group-fixture';

@Entity()
export default class LightsGroupMovingHeadWheels extends LightsGroupFixture {
  @ManyToOne(() => LightsGroup)
  @JoinColumn()
  public group: LightsGroup;

  @ManyToOne(() => LightsMovingHeadWheel, { eager: true })
  @JoinColumn()
  public fixture: LightsMovingHeadWheel;

  public toDmx(): number[] {
    return this.fixture.toDmx(this.masterRelativeBrightness);
  }
}
