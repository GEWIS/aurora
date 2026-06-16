import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import LightsFixtureShutterOptions from './lights-fixture-shutter-options';
// eslint-disable-next-line import/no-cycle
import LightsMovingHeadWheel from './lights-moving-head-wheel';

@Entity()
export default class LightsMovingHeadWheelShutterOptions extends LightsFixtureShutterOptions {
  @PrimaryColumn()
  public fixtureId: number;

  @ManyToOne(() => LightsMovingHeadWheel, { cascade: true })
  @JoinColumn({ name: 'fixtureId' })
  public fixture: LightsMovingHeadWheel;
}
