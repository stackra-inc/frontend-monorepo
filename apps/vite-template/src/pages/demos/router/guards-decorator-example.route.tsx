/**
 * Guards Decorator Example Route
 *
 * Demonstrates using @UseGuards decorator instead of guards in @Route.
 * Both approaches work - this shows the decorator pattern.
 *
 * @module pages/demos/guards-decorator-example
 */

import { Route, UseGuards } from "@stackra/react-router";
import { AuthGuard, AdminGuard } from "@/guards";

import GuardsDecoratorExample from "@/components/pages/demos/router/guards-decorator-example.component";

/**
 * Example using @UseGuards decorator.
 *
 * Guards can be applied in two ways:
 *
 * 1. Via @Route decorator (inline):
 *    @Route({ path: '/admin', guards: [AuthGuard, AdminGuard] })
 *
 * 2. Via @UseGuards decorator (separate):
 *    @UseGuards(AuthGuard, AdminGuard)
 *    @Route({ path: '/admin' })
 *
 * Both approaches are equivalent. Use @UseGuards when:
 * - You want to separate concerns
 * - Guards are reused across multiple routes
 * - You want cleaner @Route metadata
 *
 * Guards from both decorators are merged, with @UseGuards guards running first.
 */
@UseGuards(AuthGuard, AdminGuard)
@Route({
  path: "/demos/router/guards-decorator",
  label: "Guards Decorator",
  parent: "/demos",
  hideInMenu: true,
})
export class GuardsDecoratorExampleRoute {
  render() {
    return <GuardsDecoratorExample />;
  }
}
