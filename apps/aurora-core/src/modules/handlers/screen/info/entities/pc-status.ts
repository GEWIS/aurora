import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import { jsonTransformer } from '../../../../../helpers/transformers';

/**
 * One logged-in session as reported by the room's PC agent. The GEWIS
 * membership number is the identity — it is what the keyholder registry is
 * matched on — and the name is only there to be shown, so an account that
 * belongs to no member (a guest or service login) still displays sensibly with
 * a null `memberId`.
 */
export interface PcSessionUser {
  memberId: number | null;
  name: string;
}

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
 * Id of the shared virtual desktop. Unlike the physical machines it is not a
 * seat in the room but one logical PC that any number of people are logged into
 * at once, so every reported remote session folds into this single row.
 */
export const VDESKTOP_PC_ID = 'vdesktop';

/**
 * The reported status of a single PC. A single poster instance keeps this
 * table up to date by pushing the status of every PC at once (see the info
 * screen controller's bulk setter). Board/keyholder annotations are NOT stored
 * here; they are derived from the keyholder registry when the status is read.
 */
@Entity()
export default class PcStatus extends BaseEntity {
  /**
   * Stable identifier of the PC: "1".."10" for the physical machines, or
   * {@link VDESKTOP_PC_ID} for the shared virtual desktop. Used to upsert
   * reported statuses.
   */
  @Column({ unique: true })
  public pcId: string;

  /**
   * The users currently logged in. A physical PC has at most one; the virtual
   * desktop is a single PC that many people use at the same time, so it holds
   * one entry per active session. Empty when the PC is free or offline.
   *
   * `text` + JSON rather than the usual `simple-array`: an entry is a pair
   * (membership number, name), which a comma-separated list cannot hold.
   */
  @Column({
    type: 'text',
    nullable: true,
    transformer: jsonTransformer<PcSessionUser[]>(),
  })
  public users: PcSessionUser[];

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
