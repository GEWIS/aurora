import { CSSProperties, ReactNode, useState } from 'react';
import { panelStyle } from './background';
import { WidgetHeaderSlotContext } from './widgetHeaderSlot';

/** Container widgets are transparent and full-bleed; their children carry the background. */
export const CONTAINER_WIDGET_IDS = new Set(['carousel', 'status-stack']);

/** Widgets that draw their own edge-to-edge background (no card padding/title). */
export const BLEED_WIDGETS = new Set(['beer', ...CONTAINER_WIDGET_IDS]);

interface Props {
  id: string;
  title?: string;
  /** Panel background composite (`"#rrggbb|opacity|border|blur"`), or undefined for none. */
  background?: string;
  /** Grid rows spanned (used to hide the title on 1-high widgets). */
  rows: number;
  /** Grid placement style for top-level widgets; omit for children (fills parent). */
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * A titled panel for a widget. Top-level widgets get a grid `style`; children of
 * a container omit it and fill their parent. Content is vertically centred so
 * short widgets fill the card. Bleed/container widgets render chromeless. The
 * right of the title row is a slot widgets can fill via `WidgetHeaderSlotContext`.
 */
export default function WidgetCard({ id, title, background, rows, style, children }: Props) {
  const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null);
  const bgStyle = panelStyle(background);
  const showTitle = !!title && rows > 1;
  const fill = style ? '' : 'h-full w-full';
  const base = 'overflow-hidden rounded-md bg-clip-padding';

  if (BLEED_WIDGETS.has(id)) {
    return (
      <div
        className={`flex min-h-0 min-w-0 ${fill} ${base}`}
        style={{ ...style, ...bgStyle }}
        data-widget={id}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col p-4 ${fill} ${base}`}
      style={{ ...style, ...bgStyle }}
      data-widget={id}
    >
      {showTitle && (
        <div className="mb-2 flex shrink-0 items-center justify-between gap-4">
          <div className="font-raleway text-xl uppercase tracking-wide text-white/50">{title}</div>
          <div ref={setHeaderSlot} className="flex shrink-0 items-center" />
        </div>
      )}
      <WidgetHeaderSlotContext.Provider value={showTitle ? headerSlot : null}>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">{children}</div>
      </WidgetHeaderSlotContext.Provider>
    </div>
  );
}
