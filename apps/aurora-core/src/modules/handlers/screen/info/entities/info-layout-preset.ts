import { Entity, Column } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import { jsonTransformer } from '../../../../../helpers/transformers';
import { WidgetPlacement } from '../widget-catalog';

/**
 * A named, reusable info-screen layout configuration, decoupled from any screen.
 * Editors can save the current layout as a preset and load it back onto any
 * screen, making it easy to switch a screen between several arrangements (e.g.
 * "Borrel night", "Exam period"). Presets are shared across all backoffice users.
 */
@Entity()
export default class InfoLayoutPreset extends BaseEntity {
  /** Human-readable configuration name, e.g. "Borrel night". */
  @Column({ unique: true })
  public name: string;

  /** Placed grid widgets with their positions/sizes in grid cells (see
   * InfoScreenLayout for why this is `text` and not `varchar`). */
  @Column({
    type: 'text',
    nullable: true,
    transformer: jsonTransformer<WidgetPlacement[]>(),
  })
  public placements: WidgetPlacement[];

  /** Ids of the enabled modal (overlay) widgets. */
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

  /** Default panel background applied to new widgets (composite). */
  @Column({ type: 'varchar', default: '#374151|50|1|1' })
  public defaultPanelBackground: string;
}
