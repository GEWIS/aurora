import type { MenuItem } from 'primevue/menuitem';

export interface IShortcutItem extends MenuItem {
  icon?: string;
  disabledIcon?: boolean;
  enabledIcon?: boolean;
  items?: IShortcutItem[];
}
