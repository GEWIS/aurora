import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * The current "who is responsible for the room" state, plus the daily beer-time
 * countdown. This is effectively a singleton row managed through the backoffice
 * (see InfoStatusService, which always reads/writes the first row).
 */
@Entity()
export default class RoomStatus extends BaseEntity {
  /**
   * Whether the GEWIS room is currently open.
   */
  @Column({ default: false })
  public open: boolean;

  /**
   * Name of the (first) person responsible for the room, or null.
   */
  @Column({ type: 'varchar', nullable: true })
  public responsible1: string | null;

  /**
   * Name of the second person responsible for the room, or null.
   */
  @Column({ type: 'varchar', nullable: true })
  public responsible2: string | null;

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
   * When the room state was last reset for a new day. Used to apply the daily
   * reset (close the room, clear the responsibles and the beer time) once per
   * reset boundary.
   */
  @Column({ type: 'datetime', nullable: true })
  public lastResetAt: Date | null;

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
