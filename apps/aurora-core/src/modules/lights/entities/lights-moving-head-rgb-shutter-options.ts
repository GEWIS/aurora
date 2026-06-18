import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import LightsFixtureShutterOptions from './lights-fixture-shutter-options';
// eslint-disable-next-line import/no-cycle
import LightsMovingHeadRgb from './lights-moving-head-rgb';

@Entity()
export default class LightsMovingHeadRgbShutterOptions extends LightsFixtureShutterOptions {
  @PrimaryColumn()
  public fixtureId: number;

  @ManyToOne(() => LightsMovingHeadRgb, { cascade: true })
  @JoinColumn({ name: 'fixtureId' })
  public fixture: LightsMovingHeadRgb;
}
