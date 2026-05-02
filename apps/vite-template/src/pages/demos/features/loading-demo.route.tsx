/**
 * @fileoverview Loading Demo Route
 *
 * This route demonstrates the route loading system with an interactive
 * demo that allows testing different loading scenarios, progress bars,
 * skeleton screens, and loading configurations.
 *
 * ## Features Demonstrated
 *
 * - LoadingService for managing loading state
 * - useRouteLoading hook for reactive state
 * - GlobalLoading component for fixed loading bar
 * - ProgressBar component with different colors
 * - SkeletonScreen component with different layouts
 * - Loading configuration (show delay, min duration)
 * - Progress simulation (0-90% with random increments)
 *
 * @module routes/demos
 * @category Routes
 */

import { Route } from "@stackra/react-router";
import { LoadingDemoComponent } from "@/components/pages/demos/features/loading-demo.component";

/**
 * Route class for the loading demo.
 *
 * Configured with a fade transition to demonstrate smooth navigation.
 * The route itself doesn't have a loading component since it's demonstrating
 * the loading system.
 *
 * @class LoadingDemoRoute
 *
 * @example
 * ```typescript
 * // This route is automatically registered via decorator discovery
 * // Access it at: /demos/features/loading
 * ```
 */
@Route({
  /**
   * Route path.
   * Accessible at /demos/features/loading
   */
  path: "/demos/features/loading",

  /**
   * Display label for navigation menus.
   */
  label: "Route Loading States",

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
   * Transition configuration for this route.
   *
   * Uses a fade transition with 300ms duration and ease-in-out easing.
   * This provides a smooth, subtle transition when navigating to/from
   * this route.
   */
  transition: {
    type: "fade",
    duration: 300,
    easing: "ease-in-out",
  },

  /**
   * Document title for this route.
   * Sets the browser tab/window title.
   */
  title: "Route Loading States Demo - Stackra Router",
})
export class LoadingDemoRoute {
  /**
   * Renders the loading demo component.
   *
   * @returns {React.ReactElement} The demo component
   */
  render() {
    return <LoadingDemoComponent />;
  }
}
