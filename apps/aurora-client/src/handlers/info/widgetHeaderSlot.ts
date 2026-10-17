import { createContext } from 'react';

/**
 * The element on the right of a `WidgetCard` title row, which a widget can
 * portal compact content (e.g. the current temperature) into. Null when the
 * card shows no title, so callers must render their own fallback.
 */
export const WidgetHeaderSlotContext = createContext<HTMLElement | null>(null);
