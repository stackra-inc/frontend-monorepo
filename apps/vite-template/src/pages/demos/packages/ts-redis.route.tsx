/**
 * Redis Demo Route
 *
 * @module pages/demos/ts-redis
 */

import { Route } from "@stackra/react-router";

import TsRedisDemo from "@/components/pages/demos/packages/ts-redis.component";

@Route({
  path: "/demos/packages/ts-redis",
  label: "Redis",
  variant: "main",
  parent: "/demos",
  order: 48,
})
export class TsRedisDemoRoute {
  render() {
    return <TsRedisDemo />;
  }
}
