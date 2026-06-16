import { Column, Entity, Index } from 'typeorm';
import BaseEntity from '../../root/entities/base-entity';

@Entity()
export default class AuditLogEntry extends BaseEntity {
  @Index()
  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  action: string;
}
