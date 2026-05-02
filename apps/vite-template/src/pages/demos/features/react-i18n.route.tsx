/**
 * i18n Demo Route
 *
 * @module pages/demos/react-i18n
 */

import { Route } from "@stackra/react-router";

import ReactI18nDemo from "@/components/pages/demos/features/react-i18n.component";

@Route({
  path: "/demos/features/react-i18n",
  label: "i18n",
  variant: "main",
  parent: "/demos",
  order: 20,
})
export class ReactI18nDemoRoute {
  render() {
    return <ReactI18nDemo />;
  }
}
