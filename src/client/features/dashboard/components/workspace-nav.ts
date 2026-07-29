import type { LucideIcon } from 'lucide-react';

export type WorkspaceNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** The workspace root matches only exactly; every other entry matches its subtree. */
  exact?: boolean;
};

export type WorkspaceNavGroup = {
  label: string;
  items: WorkspaceNavItem[];
};

export function isNavItemActive(item: WorkspaceNavItem, pathname: string): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
