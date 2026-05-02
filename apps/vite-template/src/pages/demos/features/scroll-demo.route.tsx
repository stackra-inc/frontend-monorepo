/**
 * @fileoverview Scroll Demo Route — demonstrates scroll position management.
 *
 * Route definition for the scroll management demo page. Shows how scroll
 * positions are automatically tracked and restored across navigation.
 *
 * @module vite-template
 */

import { Route } from "@stackra/react-router";
import { ScrollDemoComponent } from "@/components/pages/demos/router/scroll-demo.component";
import { ArrowUpDown } from "lucide-react";

/**
 * Scroll Demo Route
 *
 * Demonstrates the scroll management system with automatic position
 * tracking, restoration, and hash fragment support.
 *
 * ## Features
 *
 * - Long scrollable content with multiple sections
 * - Hash fragment navigation (#section-1, #section-2, etc.)
 * - Automatic scroll restoration on back/forward navigation
 * - Manual scroll control with useScrollRestoration hook
 * - sessionStorage persistence across page refresh
 *
 * ## Route Configuration
 *
 * - **Path**: `/demos/features/scroll`
 * - **Mode**: `page` (full-page render)
 * - **Label**: Scroll Management
 * - **Icon**: ArrowUpDown
 * - **Parent**: `/demos` (nested under demos section)
 *
 * @example
 * ```typescript
 * // Navigate to scroll demo
 * navigate('/demos/features/scroll');
 *
 * // Navigate to specific section
 * navigate('/demos/features/scroll#section-5');
 * ```
 */
@Route({
  path: "/demos/features/scroll",
  label: "Scroll Management",
  icon: <ArrowUpDown className="w-5 h-5" />,
  variant: "main",
  parent: "/demos",
  order: 15,
  title: "Scroll Management Demo",
})
export class ScrollDemoRoute {
  /**
   * Render the scroll demo component.
   *
   * @returns The scroll demo page component
   */
  render() {
    return <ScrollDemoComponent />;
  }
}
