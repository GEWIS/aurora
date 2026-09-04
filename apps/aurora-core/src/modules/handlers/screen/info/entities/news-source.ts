import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';

/**
 * A news feed shown in the news ticker. Sources are managed in the backoffice;
 * the ticker aggregates the headlines of every enabled source. The default BBC
 * World and NL Times feeds are seeded as ordinary rows (see NewsService) so they
 * can be edited or removed like any custom source.
 */
@Entity()
export default class NewsSource extends BaseEntity {
  /** Display name shown next to each headline, e.g. "BBC". */
  @Column()
  public name: string;

  /** RSS/Atom feed URL to fetch headlines from. */
  @Column()
  public url: string;

  /** Whether this source contributes to the ticker. */
  @Column({ type: 'boolean', default: true })
  public enabled: boolean;
}
