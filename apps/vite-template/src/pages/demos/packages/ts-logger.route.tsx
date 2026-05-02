/**
 * Logger Demo Route
 *
 * @module pages/demos/ts-logger
 */

import { Route } from "@stackra/react-router";

import TsLoggerDemo from "@/components/pages/demos/packages/ts-logger.component";

@Route({
  path: "/demos/packages/ts-logger",
  label: "Logger",
  variant: "main",
  parent: "/demos",
  order: 45,
})
export class TsLoggerDemoRoute {
  render() {
    return <TsLoggerDemo />;
  }
}
