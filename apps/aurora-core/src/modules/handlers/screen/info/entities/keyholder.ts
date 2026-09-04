import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * A person who can be responsible for the GEWIS room. Managed through the
 * backoffice. Used both to annotate the room-responsible widget and to derive
 * board/keyholder symbols for the PC-usage widget (by membership number).
 */
@Entity()
export default class Keyholder extends BaseEntity {
  /**
   * Full name, as the association records it. On a synced row this is the API's
   * own value and cannot be edited: the API is the sole authority on what a
   * member is called.
   */
  @Column()
  public name: string;

  /**
   * What the screen calls this person, when the derived short name will not do.
   * Null means "derive it" (see display-name.ts): the given name, with as much
   * surname as it takes to tell two people apart. Backoffice-owned — a full name
   * rarely fits a seat on the workstation map.
   */
  @Column({ type: 'varchar', nullable: true })
  public displayName: string | null;

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
   * The GEWIS membership number (`lidnr`) this row was synced from, or null for
   * a row added by hand in the backoffice. The membership number rather than the
   * name is the identity, so a rename upstream updates the row instead of
   * orphaning it.
   */
  @Column({ type: 'int', nullable: true, unique: true })
  public memberId: number | null;
}
