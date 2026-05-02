/**
 * useMenu Hook
 *
 * Generates navigation menu items from registered routes.
 * Filters routes by variant, hides routes with hideInMenu, and builds
 * hierarchical menu structures based on parent relationships.
 *
 * @module @stackra/react-router
 * @category Hooks
 *
 * @example
 * ```typescript
 * function Navbar() {
 *   const { menuItems, selectedKey } = useMenu({ variant: 'main' });
 *
 *   return (
 *     <nav>
 *       {menuItems.map((item) => (
 *         <Link
 *           key={item.path}
 *           to={item.path}
 *           className={selectedKey === item.path ? 'active' : ''}
 *         >
 *           {item.icon}
 *           {item.label}
 *         </Link>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { RouteFacade } from '@/facades/route.facade';
import type { RouteDefinition } from '@/interfaces/route-definition.interface';
import type { NavigationVariant } from '@/interfaces/route-metadata.interface';

/**
 * Menu item generated from a route.
 */
export interface MenuItem {
  /** Route path */
  path: string;
  /** Display label */
  label: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Navigation variant */
  variant: NavigationVariant;
  /** Sort order */
  order: number;
  /** Parent path for nested menus */
  parent?: string;
  /** Child menu items */
  children: MenuItem[];
  /** Original route definition */
  route: RouteDefinition;
}

/**
 * Options for useMenu hook.
 */
export interface UseMenuOptions {
  /**
   * Filter routes by navigation variant.
   * If not provided, returns all routes.
   *
   * @example 'main', 'auth', 'admin'
   */
  variant?: NavigationVariant;

  /**
   * Hide routes with path parameters (e.g., '/posts/:id').
   * Useful for hiding detail/edit pages from navigation.
   *
   * @default true
   */
  hideParameterized?: boolean;
}

/**
 * Return type for useMenu hook.
 */
export interface UseMenuResult {
  /** Flat list of menu items */
  menuItems: MenuItem[];
  /** Hierarchical tree of menu items */
  menuTree: MenuItem[];
  /** Currently selected menu item path */
  selectedKey: string;
  /** Paths of all parent items that should be expanded */
  defaultOpenKeys: string[];
}

/**
 * Derives a user-friendly label from a route path.
 */
function deriveLabel(path: string): string {
  // Remove leading slash and split by /
  const segments = path.replace(/^\//, '').split('/');
  // Take the last segment
  const lastSegment = segments[segments.length - 1] || 'Home';
  // Convert kebab-case to Title Case
  return lastSegment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Checks if a path contains parameters (e.g., ':id', ':slug').
 */
function hasPathParameters(path: string): boolean {
  return /:[^/]+/.test(path);
}

/**
 * Builds a hierarchical tree from flat menu items.
 */
function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>();
  const rootItems: MenuItem[] = [];

  // First pass: create map of all items
  for (const item of items) {
    itemMap.set(item.path, { ...item, children: [] });
  }

  // Second pass: build tree structure
  for (const item of items) {
    const menuItem = itemMap.get(item.path)!;

    if (item.parent) {
      const parent = itemMap.get(item.parent);
      if (parent) {
        parent.children.push(menuItem);
      } else {
        // Parent not found, add to root
        rootItems.push(menuItem);
      }
    } else {
      rootItems.push(menuItem);
    }
  }

  // Sort items by order
  const sortItems = (items: MenuItem[]) => {
    items.sort((a, b) => a.order - b.order);
    for (const item of items) {
      if (item.children.length > 0) {
        sortItems(item.children);
      }
    }
  };

  sortItems(rootItems);

  return rootItems;
}

/**
 * Generates navigation menu items from registered routes.
 *
 * Features:
 * - Filters routes by variant (main, auth, admin, etc.)
 * - Hides routes marked with hideInMenu
 * - Optionally hides routes with path parameters
 * - Builds hierarchical menu structure based on parent relationships
 * - Sorts items by order property
 * - Derives labels from paths if not provided
 * - Tracks selected item based on current location
 *
 * @param options - Configuration options
 * @returns Menu items, tree structure, and selection state
 */
export function useMenu(options: UseMenuOptions = {}): UseMenuResult {
  const { variant, hideParameterized = true } = options;
  const location = useLocation();

  const result = useMemo(() => {
    const routes = RouteFacade.getAll();

    // Filter and transform routes to menu items
    const menuItems: MenuItem[] = routes
      .filter((route) => {
        // Skip routes marked as hidden
        if (route.hideInMenu) return false;

        // Skip routes with path parameters if hideParameterized is true
        if (hideParameterized && hasPathParameters(route.path)) return false;

        // Filter by variant if specified
        if (variant && route.variant !== variant) return false;

        // Skip drawer and dialog routes (they're not navigable)
        if (route.mode === 'drawer' || route.mode === 'dialog') return false;

        return true;
      })
      .map((route) => ({
        path: route.path,
        label: route.label || deriveLabel(route.path),
        icon: route.icon,
        variant: (route.variant || 'main') as NavigationVariant,
        order: route.order ?? 0,
        parent: route.parent,
        children: [],
        route,
      }));

    // Build hierarchical tree
    const menuTree = buildMenuTree(menuItems);

    // Find selected key (exact match or closest parent)
    const currentPath = location.pathname;
    let selectedKey = '';
    let maxMatchLength = 0;

    for (const item of menuItems) {
      if (currentPath === item.path) {
        selectedKey = item.path;
        break;
      }
      // Check if current path starts with this item's path (for nested routes)
      if (currentPath.startsWith(item.path) && item.path.length > maxMatchLength) {
        selectedKey = item.path;
        maxMatchLength = item.path.length;
      }
    }

    // Find all parent paths that should be expanded
    const defaultOpenKeys: string[] = [];
    const findParents = (path: string) => {
      const item = menuItems.find((i) => i.path === path);
      if (item?.parent) {
        defaultOpenKeys.push(item.parent);
        findParents(item.parent);
      }
    };
    if (selectedKey) {
      findParents(selectedKey);
    }

    return {
      menuItems,
      menuTree,
      selectedKey,
      defaultOpenKeys,
    };
  }, [variant, hideParameterized, location.pathname]);

  return result;
}
