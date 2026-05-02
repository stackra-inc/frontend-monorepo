/**
 * ORM Demo Route
 *
 * @module pages/demos/ts-orm
 */

import { Route } from "@stackra/react-router";

import TsOrmDemo from "@/components/pages/demos/packages/ts-orm.component";

@Route({
  path: "/demos/packages/ts-orm",
  label: "ORM",
  variant: "main",
  parent: "/demos",
  order: 46,
})
export class TsOrmDemoRoute {
  render() {
    return <TsOrmDemo />;
  }
}
