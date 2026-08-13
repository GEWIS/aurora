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
   */
  @Column({ type: 'simple-array', nullable: true })
  public usernames: string[];

  /**
   * The `objectGUID` (hex) of the directory entry this row was synced from, or
   * null for a row added by hand in the backoffice. The GUID rather than the
   * name or login is the identity, so a rename in the directory updates the row
   * instead of orphaning it.
   */
  @Column({ type: 'varchar', length: 32, nullable: true, unique: true })
  public ldapGuid: string | null;

  /**
   * The name as the directory last reported it. `name` may differ when it has
   * been overridden in the backoffice (say a long formal name shortened for the
   * screen); the sync then leaves `name` alone and only refreshes this. Keeping
   * the directory's own value here is also what makes "revert" work between
   * syncs, without another LDAP round-trip.
   */
  @Column({ type: 'varchar', nullable: true })
  public ldapName: string | null;
}
