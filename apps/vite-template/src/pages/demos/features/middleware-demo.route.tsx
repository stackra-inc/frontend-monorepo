/**
 * Middleware Demo Route
 *
 * Demonstrates route middleware with @stackra/react-router.
 * This route uses the LoggingMiddleware to track navigation events.
 *
 * @module pages/demos/middleware-demo
 */

import { Route, UseMiddleware } from "@stackra/react-router";
import { LoggingMiddleware } from "@/middleware/logging.middleware";

import MiddlewareDemo from "@/components/pages/demos/features/middleware-demo.component";

@UseMiddleware(LoggingMiddleware)
@Route({
  path: "/demos/features/middleware",
  label: "Middleware Demo",
  parent: "/demos",
  hideInMenu: true,
})
export class MiddlewareDemoRoute {
  render() {
    return <MiddlewareDemo />;
  }
}
