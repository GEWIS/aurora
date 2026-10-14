import type { MenuItem } from 'openvue/menuitem';

export interface IShortcutItem extends MenuItem {
  icon?: string;
  disabledIcon?: boolean;
  enabledIcon?: boolean;
  items?: IShortcutItem[];
}
