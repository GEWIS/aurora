import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import BaseEntity from '../../../../common/entities/base-entity';
import { File } from '../../../../files/entities';

/**
 * List of every supported poster type.
 */
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

/**
 * List of possible footersizes.
 */
export enum FooterSize {
  FULL = 'full',
  MINIMAL = 'minimal',
  HIDDEN = 'hidden',
}

/**
 * Global poster entity.
 */
@Entity()
export default class Poster extends BaseEntity {
  /**
   * Internal name of the poster. Visible in backoffice and database.
   */
  @Column()
  name: string;

  /**
   * Type of the poster. Should be a valid PosterType.
   */
  @Column({ type: 'varchar' })
  type: PosterType;

  /**
   * Whether the poster is manually disabled through backoffice.
   */
  @Column({ default: true })
  enabled: boolean;

  /**
   * The visible title of the poster on the screens.
   */
  @Column({ nullable: true })
  label?: string;

  /**
   * Moment from when the poster should be in rotation.
   */
  @Column({ nullable: true })
  startDate?: Date;

  /**
   * Moment from when the poster should be out of rotation.
   */
  @Column({ nullable: true })
  expirationDate?: Date;

  /**
   * Color of the progressbar mostly.
   */
  @Column({ nullable: true })
  accentColor?: string;

  /**
   * Whether the poster should be manually deletable.
   */
  @Column({ default: false })
  protected: boolean;

  /**
   * Whether the poster should only be displayed in borrelMode.
   */
  @Column({ default: false })
  borrelMode: boolean;

  /**
   * The size of the footer. Should be a valid FooterSize.
   */
  @Column({ type: 'varchar', default: FooterSize.FULL })
  footerSize: FooterSize;

  /**
   * The time the poster should be on the screens for.
   */
  @Column({ default: 15 })
  defaultTimeout: number;

  /**
   * If the poster is of type external this holds the link to the resource.
   */
  @Column({ nullable: true })
  uri?: string;

  /**
   * If the poster is of type photo this contains the ids of the GEWISweb albums this poster should
   * pick from.
   */
  @Column({ type: 'simple-array', nullable: true })
  albums?: number[];

  /**
   * If the poster is either an image or video this stores a reference to the associated files in
   * the file repo.
   */
  @ManyToMany(() => File, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({
    joinColumn: { name: 'posterId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fileId', referencedColumnName: 'id' },
  })
  files: File[];

  /**
   * Flag set to true when the poster is imported from trello.
   * Used to manage trello specific actions and prevents the poster from being managed through
   * backoffice.
   */
  @Column({ default: false })
  trello: boolean;

  /**
   * Id of the trello card containing the poster. Used to determine whether the poster has changed
   * since the last sync.
   */
  @Column({ type: 'text', nullable: true })
  trelloCardId?: string;

  /**
   * Moment of the last change of the card on trello. Used during the sync with trello.
   */
  @Column({ type: 'text', nullable: true })
  trelloLastActivity?: string;
}
