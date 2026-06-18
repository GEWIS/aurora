import BaseEntity from '../../../root/entities/base-entity';
import { Column, Entity } from 'typeorm';
import { jsonTransformer } from '../../../../helpers/transformers';

@Entity()
/**
 * Special type of user that should be used for machine-to-machine communication.
 * For example, an adapter to send commands from some system to Aurora.
 */
export default class IntegrationUser extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  /**
   * When this integration has last made an API call
   */
  @Column({
    type: 'varchar',
    nullable: true,
    transformer: {
      from(value: string | null): Date | null {
        if (value == null) return null;
        return new Date(value);
      },
      to(value: Date | null): string | null {
        if (value == null) return null;
        return value.toISOString();
      },
    },
  })
  lastSeen: Date | null;

  /**
   * List of endpoints (operationIds) this user can access
   */
  @Column({
    nullable: true,
    type: 'varchar',
    transformer: jsonTransformer<string[]>(),
  })
  endpoints: string[];
}
