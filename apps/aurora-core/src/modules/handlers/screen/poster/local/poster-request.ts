import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import { File } from '../../../../files/entities';
import { IntegrationUser } from '../../../../auth/integration/entities';
import { FooterSize, PosterType } from './poster';

/**
 * Request for a new media or external poster, submitted by an integration and waiting for review
 * in the backoffice. Approving it creates a regular poster; approving or denying it deletes the
 * request, including the requester's personal details and the uploaded file.
 */
@Entity()
export default class PosterRequest extends BaseEntity {
  /**
   * Name of the person who requested the poster.
   */
  @Column()
  requesterName: string;

  /**
   * Email address of the person who requested the poster.
   */
  @Column()
  requesterEmail: string;

  /**
   * Association the poster is requested for, if any.
   */
  @Column({ nullable: true })
  requesterAssociation?: string;

  /**
   * Optional message from the requester to the reviewers.
   */
  @Column({ type: 'text', nullable: true })
  message?: string;

  /**
   * Integration that submitted this request, if it still exists.
   */
  @ManyToOne(() => IntegrationUser, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'integrationUserId' })
  integrationUser?: IntegrationUser | null;

  /**
   * Requested internal name of the poster.
   */
  @Column()
  name: string;

  /**
   * Type of the requested poster, derived from the uploaded file or the given uri.
   */
  @Column({ type: 'varchar' })
  type: PosterType.IMAGE | PosterType.VIDEO | PosterType.EXTERNAL;

  /**
   * Link to the requested external poster. Only set for external posters.
   */
  @Column({ nullable: true })
  uri?: string;

  /**
   * Requested visible title of the poster.
   */
  @Column({ nullable: true })
  label?: string;

  /**
   * Requested moment from when the poster should be in rotation.
   */
  @Column({ nullable: true })
  startDate?: Date;

  /**
   * Requested moment from when the poster should be out of rotation.
   */
  @Column({ nullable: true })
  expirationDate?: Date;

  /**
   * Requested color of the progressbar.
   */
  @Column({ nullable: true })
  accentColor?: string;

  /**
   * Requested footer size.
   */
  @Column({ type: 'varchar', default: FooterSize.FULL })
  footerSize: FooterSize;

  /**
   * Requested time the poster should be on the screens for.
   */
  @Column({ default: 15 })
  defaultTimeout: number;

  /**
   * The uploaded image or video, stored privately until the request is approved. Not set for
   * external posters.
   */
  @ManyToOne(() => File, { nullable: true, eager: true })
  @JoinColumn({ name: 'fileId' })
  file?: File | null;
}
