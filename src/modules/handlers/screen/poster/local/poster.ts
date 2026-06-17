import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import { File } from '../../../../files/entities';

export enum PosterType {
  UNKNOWN = 'unknown',
  ERROR = 'error',
  AGENDA = 'agenda',
  INFIMA = 'infima',
  TRAINS = 'train',
  IMAGE = 'img',
  LOGO = 'logo',
  EXTERNAL = 'extern',
  PHOTO = 'photo',
  VIDEO = 'video',
  BORREL_LOGO = 'borrel-logo',
  BORREL_PRICE_LIST = 'borrel-price-list',
  BORREL_WALL_OF_SHAME = 'borrel-wall-of-shame',
  OLYMPICS = 'olympics',
}

export enum FooterSize {
  FULL = 'full',
  MINIMAL = 'minimal',
  HIDDEN = 'hidden',
}

@Entity()
export default class Poster extends BaseEntity {
  @Column()
  name: string;

  @Column()
  type: PosterType;

  @Column({ default: true })
  enabled: boolean;

  @Column({ nullable: true })
  label?: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  expirationDate?: Date;

  @Column({ nullable: true })
  accentColor?: string;

  @Column({ default: false })
  protected: boolean;

  @Column({ default: false })
  borrelMode: boolean;

  @Column({ default: FooterSize.FULL })
  footerSize: FooterSize;

  @Column({ default: 15 })
  defaultTimeout: number;

  @Column({ nullable: true })
  uri?: string;

  @Column({ type: 'simple-array', nullable: true })
  albums?: number[];

  @ManyToMany(() => File, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({
    joinColumn: { name: 'posterId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fileId', referencedColumnName: 'id' },
  })
  files: File[];

  @Column({ default: false })
  trello: boolean;

  @Column({ type: 'text', nullable: true })
  trelloCardId?: string;

  @Column({ type: 'text', nullable: true })
  trelloLastActivity?: string;
}
