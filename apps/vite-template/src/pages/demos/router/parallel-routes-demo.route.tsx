/**
 * @fileoverview Parallel Routes Demo
 *
 * Demonstrates parallel routes with named outlets rendering simultaneously.
 * Each outlet has independent loading states and error boundaries.
 */

import { useState } from "react";
import { Route, NamedOutlet, useOutlets } from "@stackra/react-router";
import { Card, Button, Badge, Spinner } from "@heroui/react";
import { Layout, Sidebar, PanelTop } from "lucide-react";

/**
 * Main Dashboard Route (default outlet)
 */
@Route({
  path: "/demos/router/parallel-routes",
  outlet: "default",
  meta: {
    title: "Parallel Routes Demo",
    description: "Demonstrates parallel routes with named outlets",
  },
})
export class ParallelRoutesDemoRoute {
  render() {
    return <ParallelRoutesMainPage />;
  }
}

/**
 * Sidebar Outlet Route
 */
@Route({
  path: "/demos/router/parallel-routes",
  outlet: "sidebar",
})
export class ParallelRoutesSidebarRoute {
  render() {
    return <SidebarContent />;
  }
}

/**
 * Panel Outlet Route
 */
@Route({
  path: "/demos/router/parallel-routes",
  outlet: "panel",
})
export class ParallelRoutesPanelRoute {
  render() {
    return <PanelContent />;
  }
}

/**
 * Main Page Component
 */
function ParallelRoutesMainPage() {
  const outlets = useOutlets();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Parallel Routes Demo</h1>
        <p className="text-default-500">
          Multiple outlets rendering simultaneously with independent states
        </p>
      </div>

      {/* Outlet Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Outlet Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(outlets).map(([name, state]) => (
            <div key={name} className="p-4 bg-default-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{name}</h3>
                <Badge color={state.loading ? "warning" : state.error ? "danger" : "success"}>
                  {state.loading ? "Loading" : state.error ? "Error" : "Ready"}
                </Badge>
              </div>
              <p className="text-xs text-default-500">Route: {state.route?.path || "None"}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Layout with Named Outlets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Outlet */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sidebar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Sidebar Outlet</h3>
            </div>
            <NamedOutlet
              name="sidebar"
              fallback={
                <div className="flex items-center justify-center p-8">
                  <Spinner size="sm" />
                </div>
              }
            />
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main Content Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold">Main Content</h3>
            </div>
            <MainContent />
          </Card>

          {/* Panel Outlet */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PanelTop className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Panel Outlet</h3>
            </div>
            <NamedOutlet
              name="panel"
              fallback={
                <div className="flex items-center justify-center p-8">
                  <Spinner size="sm" />
                </div>
              }
            />
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Named Outlets</h3>
            <p className="text-default-500">
              Routes can target specific outlets using the <code>outlet</code> property. Multiple
              routes with the same path but different outlets render simultaneously.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Independent Loading States</h3>
            <p className="text-default-500">
              Each outlet has its own loading state. If one outlet is loading, others continue to
              display their content without interruption.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Independent Error Boundaries</h3>
            <p className="text-default-500">
              Errors in one outlet don't affect others. Each outlet can have its own error fallback
              component for graceful error handling.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Outlet Manager Service</h3>
            <p className="text-default-500">
              The <code>OutletManagerService</code> tracks all outlet states using a pub/sub
              pattern. The <code>useOutlets</code> hook subscribes to state changes.
            </p>
          </div>
        </div>
      </Card>

      {/* Use Cases */}
      <Card className="p-6 bg-primary-50 dark:bg-primary-950">
        <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Layout className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Dashboard Layouts:</strong> Render sidebar, main content, and panels
              independently with different data sources.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Layout className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Split Views:</strong> Show multiple perspectives of the same data (e.g., code
              editor + preview).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Layout className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Multi-Step Forms:</strong> Render form steps in main content while showing
              progress in sidebar.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Layout className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Real-time Updates:</strong> Update specific outlets independently based on
              WebSocket events.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

/**
 * Main Content Component
 */
function MainContent() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4">
      <p className="text-default-500">
        This is the main content area. It renders in the default outlet and has its own independent
        state.
      </p>
      <div className="flex items-center gap-4">
        <Button onPress={() => setCount((c) => c + 1)}>Increment</Button>
        <Badge color="accent" size="lg">
          Count: {count}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Sidebar Content Component
 */
function SidebarContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-default-500">
        This sidebar renders in the "sidebar" outlet independently from the main content.
      </p>
      <div className="space-y-2">
        <Button size="sm" variant="ghost" fullWidth>
          Menu Item 1
        </Button>
        <Button size="sm" variant="ghost" fullWidth>
          Menu Item 2
        </Button>
        <Button size="sm" variant="ghost" fullWidth>
          Menu Item 3
        </Button>
      </div>
    </div>
  );
}

/**
 * Panel Content Component
 */
function PanelContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-default-500">
        This panel renders in the "panel" outlet with its own loading and error states.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-lg">
          <p className="text-xs font-semibold text-primary">Metric 1</p>
          <p className="text-lg font-bold">1,234</p>
        </div>
        <div className="p-3 bg-secondary-50 dark:bg-secondary-950 rounded-lg">
          <p className="text-xs font-semibold text-secondary">Metric 2</p>
          <p className="text-lg font-bold">5,678</p>
        </div>
      </div>
    </div>
  );
}
