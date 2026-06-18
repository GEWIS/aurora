import { BaseEntity, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Audio, LightsController, Screen } from '../../root/entities';
import { IntegrationUser } from '../integration/entities';
import { AuthUser } from '../auth-user';
import { SecurityGroup } from '../../../helpers/security';

@Entity()
export default class ApiKey extends BaseEntity {
  @PrimaryColumn()
  public key: string;

  @OneToOne(() => Screen, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  public screen?: Screen | null;

  @OneToOne(() => LightsController, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  public lightsController?: LightsController | null;

  @OneToOne(() => Audio, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  public audio?: Audio | null;

  @OneToOne(() => IntegrationUser, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  public integrationUser?: IntegrationUser | null;

  public asAuthUser(): AuthUser {
    const roles: SecurityGroup[] = [];
    let endpoints: string[] | undefined;
    const names: string[] = [];
    const ids: string[] = [];
    if (this.audio) {
      roles.push(SecurityGroup.AUDIO_SUBSCRIBER);
      names.push(this.audio.name);
      ids.push(`audio${this.audio.id}`);
    }
    if (this.screen) {
      roles.push(SecurityGroup.SCREEN_SUBSCRIBER);
      names.push(this.screen.name);
      ids.push(`screen${this.screen.id}`);
    }
    if (this.lightsController) {
      roles.push(SecurityGroup.LIGHTS_SUBSCRIBER);
      names.push(this.lightsController.name);
      ids.push(`lightsController${this.lightsController.id}`);
    }
    if (this.integrationUser) {
      roles.push(SecurityGroup.INTEGRATION_USER);
      names.push(this.integrationUser.name);
      ids.push(`integrationUser${this.integrationUser.id}`);
      endpoints = this.integrationUser.endpoints;
    }

    return {
      id: ids.join('-'),
      name: names.join('-'),
      roles,
      endpoints,
      audioId: this.audio?.id,
      screenId: this.screen?.id,
      lightsControllerId: this.lightsController?.id,
      integrationUserId: this.integrationUser?.id,
    };
  }
}
