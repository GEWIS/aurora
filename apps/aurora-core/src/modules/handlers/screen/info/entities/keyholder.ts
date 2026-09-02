import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * A person who can be responsible for the GEWIS room. Managed through the
 * backoffice. Used both to annotate the room-responsible widget and to derive
 * board/keyholder symbols for the PC-usage widget (by matching usernames).
 */
@Entity()
export default class Keyholder extends BaseEntity {
  /**
   * Display name shown on the info screen.
   */
  @Column()
  public name: string;

  /**
   * Whether this person is a board member (shown with ★).
   */
  @Column({ default: false })
  public isBoard: boolean;

  /**
   * Whether this person is a candidate board member (shown with 🍬, or 🍭 when
   * also a keyholder).
   */
  @Column({ default: false })
  public isCandidateBoard: boolean;

  /**
   * Whether this person is a keyholder (shown with 🔑).
   */
  @Column({ default: false })
  public isKeyholder: boolean;

  /**
   * Optional profile photo shown on the info screen.
   */
  @Column({ type: 'varchar', nullable: true })
  public photoUrl: string | null;

  /**
   * Login names belonging to this person, used to match PC-usage reports so the
   * correct symbol can be shown. Stored as a comma-separated list.
   *
   * Backoffice-owned: the GEWIS API identifies members by membership number and
   * name, not by login, so a synced row is seeded with the member's full name
   * and left alone afterwards.
   */
  @Column({ type: 'simple-array', nullable: true })
  public usernames: string[];

  /**
   * The GEWIS membership number (`lidnr`) this row was synced from, or null for
   * a row added by hand in the backoffice. The membership number rather than the
   * name is the identity, so a rename upstream updates the row instead of
   * orphaning it.
   */
  @Column({ type: 'int', nullable: true, unique: true })
  public memberId: number | null;

  /**
   * The name as the API last reported it. `name` may differ when it has been
   * overridden in the backoffice (say a long formal name shortened for the
   * screen); the sync then leaves `name` alone and only refreshes this. Keeping
   * the API's own value here is also what makes "revert" work between syncs,
   * without another round-trip.
   */
  @Column({ type: 'varchar', nullable: true })
  public syncedName: string | null;
}
