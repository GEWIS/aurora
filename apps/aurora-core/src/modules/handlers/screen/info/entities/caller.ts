import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * A known caller in the phone directory. When the phone system reports an
 * incoming call, the reported number/SIP is matched against every caller's
 * {@link numbers} to show the caller's name and photo on the screen. Mirrors the
 * legacy `lync_caller.php` directory.
 */
@Entity()
export default class Caller extends BaseEntity {
  /** Display name, e.g. "GEWIS" or a member's name. */
  @Column()
  public name: string;

  /**
   * The phone numbers and/or SIP addresses that identify this caller. Matched
   * case-insensitively (after normalisation) against the reported caller id.
   */
  @Column({ type: 'simple-array', nullable: true })
  public numbers: string[];

  /** Optional photo/logo URL shown in the incoming-call overlay. */
  @Column({ type: 'varchar', nullable: true })
  public photoUrl: string | null;
}
