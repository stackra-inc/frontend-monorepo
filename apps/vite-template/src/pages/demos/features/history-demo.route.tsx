/**
 * @fileoverview History Demo Route
 *
 * This route demonstrates the history management system with an interactive
 * demo that allows testing all history navigation methods including push,
 * replace, back, forward, and go. Shows how to attach custom state to
 * navigation actions and track history stack changes.
 *
 * ## Features Demonstrated
 *
 * - useHistory hook for navigation
 * - push() and replace() methods
 * - back(), forward(), and go() traversal
 * - canGoBack() and canGoForward() queries
 * - getLength() for history stack depth
 * - Custom state objects attached to navigation
 *
 * @module routes/demos
 * @category Routes
 */

import { Route } from "@stackra/react-router";
import { HistoryDemoComponent } from "@/components/pages/demos/features/history-demo.component";

/**
 * Route class for the history management demo.
 *
 * Provides an interactive interface to test all history navigation
 * methods and see how they affect the browser's history stack.
 *
 * @class HistoryDemoRoute
 *
 * @example
 * ```typescript
 * // This route is automatically registered via decorator discovery
 * // Access it at: /demos/features/history
 * ```
 */
@Route({
  /**
   * Route path.
   * Accessible at /demos/features/history
   */
  path: "/demos/features/history",

  /**
   * Display label for navigation menus.
   */
  label: "History Management",

  /**
   * Navigation variant for menu grouping.
   * Groups this route with other main navigation items.
   */
  variant: "main",

  /**
   * Parent route for hierarchical navigation.
   * Makes this a child of the Demos route.
   */
  parent: "/demos",

  /**
   * Sort order in navigation menus.
   * Lower numbers appear first.
   */
  order: 110,

  /**
   * Document title for this route.
   * Sets the browser tab/window title.
   */
  title: "History Management Demo - Stackra Router",
})
export class HistoryDemoRoute {
  /**
   * Renders the history demo component.
   *
   * @returns {React.ReactElement} The demo component
   */
  render() {
    return <HistoryDemoComponent />;
  }
}
