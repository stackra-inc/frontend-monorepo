/**
 * @fileoverview Router Transitions Demo Route
 *
 * This route demonstrates the route transition system with an interactive
 * demo that allows testing different transition types, durations, and easing
 * functions. The route itself uses a fade transition as an example.
 *
 * ## Features Demonstrated
 *
 * - Transition configuration via @Route decorator
 * - useTransition hook for reactive state
 * - Different transition types (fade, slide, scale)
 * - Duration and easing customization
 * - Navigation with transitions
 *
 * @module routes/demos
 * @category Routes
 */

import { Route } from "@stackra/react-router";
import { RouterTransitionsComponent } from "@/components/pages/demos/router/router-transitions.component";

/**
 * Route class for the transitions demo.
 *
 * Configured with a fade transition to demonstrate the feature.
 * The transition settings can be modified to test different effects.
 *
 * @class RouterTransitionsRoute
 *
 * @example
 * ```typescript
 * // This route is automatically registered via decorator discovery
 * // Access it at: /demos/router/transitions
 * ```
 */
@Route({
  /**
   * Route path.
   * Accessible at /demos/router/transitions
   */
  path: "/demos/router/transitions",

  /**
   * Display label for navigation menus.
   */
  label: "Route Transitions",

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
  order: 100,

  /**
   * Transition configuration for this route.
   *
   * Uses a fade transition with 300ms duration and ease-in-out easing.
   * This provides a smooth, subtle transition when navigating to/from
   * this route.
   *
   * Try changing these values to see different effects:
   * - type: 'fade' | 'slide' | 'scale' | 'none'
   * - duration: 0-5000 (milliseconds)
   * - easing: CSS easing function
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
  title: "Route Transitions Demo - Stackra Router",
})
export class RouterTransitionsRoute {
  /**
   * Renders the transitions demo component.
   *
   * @returns {React.ReactElement} The demo component
   */
  render() {
    return <RouterTransitionsComponent />;
  }
}
