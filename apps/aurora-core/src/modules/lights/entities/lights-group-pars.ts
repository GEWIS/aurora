import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import LightsGroup from './lights-group';
import LightsPar from './lights-par';
import LightsGroupFixture from './lights-group-fixture';

@Entity()
export default class LightsGroupPars extends LightsGroupFixture {
  @ManyToOne(() => LightsGroup, (group) => group.pars)
  @JoinColumn()
  public group: LightsGroup;

  @ManyToOne(() => LightsPar, { eager: true })
  @JoinColumn()
  public fixture: LightsPar;

  public toDmx(): number[] {
    return this.fixture.toDmx(this.masterRelativeBrightness);
  }
}
