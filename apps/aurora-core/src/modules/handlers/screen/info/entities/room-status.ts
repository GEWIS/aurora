import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * The current "who is responsible for the room" state, plus the daily beer-time
 * countdown. This is effectively a singleton row managed through the backoffice
 * (see InfoStatusService, which always reads/writes the first row).
 *
 * `updatedAt` is load-bearing: the daily reset is derived from it rather than
 * persisted, so state last written before the current reset boundary reads as a
 * closed room. Every write must therefore bump it (InfoStatusService does so
 * explicitly), and any future endpoint that touches only the non-daily columns
 * (lastCall, closedMessage, coffeeStatus) would wrongly mark the daily state as
 * current again.
 */
@Entity()
export default class RoomStatus extends BaseEntity {
  /**
   * Whether the GEWIS room is currently open.
   */
  @Column({ default: false })
  public open: boolean;

  /**
   * GEWIS membership number of the (first) person responsible for the room, or
   * null.
   *
   * The number rather than the name: the sync overwrites a keyholder's name
   * from the GEWIS records whenever it changes upstream, and a stored name
   * would then quietly stop matching, blanking the photo and the board flags
   * with nothing to show for it.
   */
  @Column({ type: 'int', nullable: true })
  public responsible1MemberId: number | null;

  /** Membership number of the second person responsible, or null. */
  @Column({ type: 'int', nullable: true })
  public responsible2MemberId: number | null;

  /**
   * Time of the daily "beer time" countdown as "HH:mm", or null when there is
   * no beer time today.
   */
  @Column({ type: 'varchar', nullable: true })
  public beerTime: string | null;

  /**
   * Last-call time shown by the beer widget, e.g. "22:00", or null/empty when
   * there is no last call. Free-form so it can hold any label.
   */
  @Column({ type: 'varchar', nullable: true })
  public lastCall: string | null;

  /**
   * Message shown when the room is closed, e.g. "GEWIS is closed".
   */
  @Column({ type: 'varchar', nullable: true })
  public closedMessage: string | null;

  /**
   * Coffee/tea machine status, using the legacy code (0 = "It works" .. 10 =
   * "Unknown"). Set in the backoffice; rendered by the coffee widget.
   */
  @Column({ type: 'int', default: 0 })
  public coffeeStatus: number;
}
