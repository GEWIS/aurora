import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import LightsFixtureShutterOptions from './lights-fixture-shutter-options';
// eslint-disable-next-line import/no-cycle
import LightsPar from './lights-par';

@Entity()
export default class LightsParShutterOptions extends LightsFixtureShutterOptions {
  @PrimaryColumn()
  public fixtureId: number;

  @ManyToOne(() => LightsPar, { cascade: true })
  @JoinColumn({ name: 'fixtureId' })
  public fixture: LightsPar;
}
