import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * A conference room shown by the info screen. Availability and today's bookings
 * are derived from the room's iCal calendar feed (if configured). Managed in the
 * backoffice.
 */
@Entity()
export default class ConferenceRoom extends BaseEntity {
  /** Room identifier / number, e.g. "MF 3.141". */
  @Column()
  public number: string;

  /** iCal calendar URL used to derive availability + today's bookings. */
  @Column({ type: 'varchar', nullable: true })
  public icalUrl: string | null;
}
