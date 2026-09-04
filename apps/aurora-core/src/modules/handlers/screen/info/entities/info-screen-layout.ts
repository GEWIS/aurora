import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import { jsonTransformer } from '../../../../../helpers/transformers';
import { WidgetPlacement } from '../widget-catalog';

/**
 * The per-screen widget layout for the info screen. Each screen (identified by
 * its Screen id) has its own arrangement of placed grid widgets plus a set of
 * enabled modal (overlay) widgets. Screens without a saved row fall back to the
 * default layout (see {@link DEFAULT_LAYOUT}).
 */
@Entity()
export default class InfoScreenLayout extends BaseEntity {
  /** The Screen this layout belongs to. */
  @Column({ unique: true })
  public screenId: number;

  /**
   * Placed grid widgets with their positions/sizes in grid cells.
   *
   * `text` rather than the usual `varchar` for a JSON column: a full layout with
   * per-widget settings and container children runs to several kilobytes, which
   * MySQL's varchar(255) would not hold (SQLite ignores the length, so this only
   * bites in production).
   */
  @Column({
    type: 'text',
    nullable: true,
    transformer: jsonTransformer<WidgetPlacement[]>(),
  })
  public placements: WidgetPlacement[];

  /** Ids of the enabled modal (overlay) widgets, e.g. "beer-modal", "caller". */
  @Column({ type: 'simple-array', nullable: true })
  public modals: string[];

  /** Screen-wide background style (see BACKGROUND_OPTIONS). */
  @Column({ type: 'varchar', default: 'hexagons' })
  public background: string;

  /** Image URL used when `background` is 'image'. */
  @Column({ type: 'varchar', default: '' })
  public backgroundImage: string;

  /** Solid colour (hex) used when `background` is 'color'. */
  @Column({ type: 'varchar', default: '#0b1020' })
  public backgroundColor: string;

  /**
   * Default panel background (composite `"#rrggbb|opacity|border|blur"`) applied
   * to newly added widgets and by the editor's "apply to all widgets" action.
   */
  @Column({ type: 'varchar', default: '#374151|50|1|1' })
  public defaultPanelBackground: string;
}
