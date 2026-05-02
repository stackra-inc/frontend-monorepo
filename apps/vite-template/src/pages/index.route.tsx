/**
 * Home Page Route
 *
 * @module pages/index
 */

import { Route } from "@stackra/react-router";

import IndexPage from "@/components/pages/index.component";

@Route({
  path: "/",
  label: "Home",
  variant: "main",
  order: 1,
})
export class IndexRoute {
  render() {
    return <IndexPage />;
  }
}
