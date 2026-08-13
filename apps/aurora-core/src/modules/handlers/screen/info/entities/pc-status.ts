import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * Possible states of a physical or virtual PC in the GEWIS room.
 */
export enum PcStatusType {
  FREE = 'free',
  IN_USE = 'in-use',
  LOCKED = 'locked',
  REMOTE = 'remote',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
}

/**
 * Backoffice-controlled override that takes precedence over reported statuses.
 * MAINTENANCE forces the PC to show as under maintenance; DISABLED hides it from
 * the screen entirely. Both persist across status posts until cleared.
 */
export enum PcOverride {
  NONE = 'none',
  MAINTENANCE = 'maintenance',
  DISABLED = 'disabled',
}

/**
 * The reported status of a single PC. A single poster instance keeps this
 * table up to date by pushing the status of every PC at once (see the info
 * screen controller's bulk setter). Board/keyholder annotations are NOT stored
 * here; they are derived from the keyholder registry when the status is read.
 */
@Entity()
export default class PcStatus extends BaseEntity {
  /**
   * Stable identifier of the PC, e.g. "1".."10" for the physical machines or a
   * hostname for virtual desktops. Used to upsert reported statuses.
   */
  @Column({ unique: true })
  public pcId: string;

  /**
   * The logged-in user, or null when the PC is free/offline.
   */
  @Column({ type: 'varchar', nullable: true })
  public username: string | null;

  /**
   * Whether the session is a remote/virtual desktop session.
   */
  @Column({ default: false })
  public remote: boolean;

  /**
   * When the PC was locked, or null when it is not locked.
   */
  @Column({ type: 'datetime', nullable: true })
  public lockedAt: Date | null;

  /**
   * The reported status of the PC.
   */
  @Column({ type: 'varchar', default: PcStatusType.OFFLINE })
  public status: PcStatusType;

  /**
   * Backoffice override (maintenance / disabled). Preserved across status posts.
   */
  @Column({ type: 'varchar', default: PcOverride.NONE })
  public overrideState: PcOverride;
}
