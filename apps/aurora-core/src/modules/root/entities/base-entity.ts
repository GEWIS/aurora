import {
  BaseEntity as TypeormBaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export default class BaseEntity extends TypeormBaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn()
  public readonly createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
