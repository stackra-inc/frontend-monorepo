/**
 * @fileoverview Prefetch Demo Route
 *
 * Demonstrates route prefetching with different strategies:
 * - Hover: Prefetch on mouse hover (100ms delay)
 * - Focus: Prefetch on focus (immediate)
 * - Manual: Programmatic prefetch
 * - None: No prefetch (default behavior)
 *
 * Shows LRU cache behavior and prefetch status indicators.
 */

import { useState } from "react";
import { Route, AppLink, usePrefetch } from "@stackra/react-router";
import { Button, Card, Badge } from "@heroui/react";
import { Zap, MousePointer, Focus, Hand, Ban } from "lucide-react";

/**
 * Prefetch Demo Route
 *
 * Showcases all prefetch strategies and cache behavior.
 */
@Route({
  path: "/demos/router/prefetch",
  label: "Route Prefetching",
  variant: "main",
  parent: "/demos",
  order: 30,
  meta: {
    title: "Route Prefetching Demo",
    description: "Demonstrates route prefetching strategies and cache behavior",
  },
})
export class PrefetchDemoRoute {
  render() {
    return <PrefetchDemoPage />;
  }
}

/**
 * Prefetch Demo Page Component
 */
function PrefetchDemoPage() {
  const { prefetch } = usePrefetch();
  const [cacheSize, setCacheSize] = useState(0);
  const [manualPrefetchStatus, setManualPrefetchStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  /**
   * Handle manual prefetch
   */
  const handleManualPrefetch = async () => {
    setManualPrefetchStatus("loading");
    try {
      await prefetch("/demos/router/nested-routes");
      setManualPrefetchStatus("success");
      setTimeout(() => setManualPrefetchStatus("idle"), 2000);
    } catch (error) {
      setManualPrefetchStatus("error");
      setTimeout(() => setManualPrefetchStatus("idle"), 2000);
    }
  };

  /**
   * Handle cache clear
   */
  const handleClearCache = () => {
    setCacheSize(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Route Prefetching Demo</h1>
        <p className="text-default-500">
          Demonstrates different prefetch strategies and cache behavior
        </p>
      </div>

      {/* Cache Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Cache Status</h2>
            <p className="text-sm text-default-500">
              Prefetched routes: <Badge color="accent">{cacheSize}</Badge>
            </p>
          </div>
          <Button variant="ghost" onPress={handleClearCache} isDisabled={cacheSize === 0}>
            Clear Cache
          </Button>
        </div>
      </Card>

      {/* Prefetch Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hover Strategy */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <MousePointer className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Hover Strategy</h3>
              <p className="text-sm text-default-500">Prefetch after 100ms hover delay</p>
            </div>
          </div>
          <AppLink
            to="/demos/features/middleware"
            prefetch="hover"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Hover me to prefetch
          </AppLink>
        </Card>

        {/* Focus Strategy */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Focus className="w-6 h-6 text-secondary" />
            <div>
              <h3 className="text-lg font-semibold">Focus Strategy</h3>
              <p className="text-sm text-default-500">Prefetch immediately on focus</p>
            </div>
          </div>
          <AppLink
            to="/demos/features/query-params"
            prefetch="focus"
            className="inline-block px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-600 transition-colors"
          >
            Focus me to prefetch
          </AppLink>
        </Card>

        {/* Manual Strategy */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Hand className="w-6 h-6 text-warning" />
            <div>
              <h3 className="text-lg font-semibold">Manual Strategy</h3>
              <p className="text-sm text-default-500">Programmatic prefetch control</p>
            </div>
          </div>
          <Button
            variant="tertiary"
            onPress={handleManualPrefetch}
            isPending={manualPrefetchStatus === "loading"}
          >
            {manualPrefetchStatus === "success" ? (
              <span>✓</span>
            ) : manualPrefetchStatus === "error" ? (
              <span>✗</span>
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {manualPrefetchStatus === "loading"
              ? "Prefetching..."
              : manualPrefetchStatus === "success"
                ? "Prefetched!"
                : manualPrefetchStatus === "error"
                  ? "Failed"
                  : "Prefetch Nested Routes"}
          </Button>
        </Card>

        {/* None Strategy */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Ban className="w-6 h-6 text-danger" />
            <div>
              <h3 className="text-lg font-semibold">None Strategy</h3>
              <p className="text-sm text-default-500">No prefetch (default behavior)</p>
            </div>
          </div>
          <AppLink
            to="/demos/features/scroll"
            prefetch="none"
            className="inline-block px-4 py-2 bg-default-200 text-default-700 rounded-lg hover:bg-default-300 transition-colors"
          >
            No prefetch on this link
          </AppLink>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Hover Strategy</h3>
            <p className="text-default-500">
              Waits 100ms after mouse enters the link before prefetching. This prevents unnecessary
              prefetches when users quickly move their mouse across the page.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Focus Strategy</h3>
            <p className="text-default-500">
              Prefetches immediately when the link receives focus (keyboard navigation). Great for
              accessibility and keyboard-first users.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Manual Strategy</h3>
            <p className="text-default-500">
              Gives you full control over when to prefetch. Use the <code>usePrefetch</code> hook to
              prefetch routes programmatically based on your app's logic.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">LRU Cache</h3>
            <p className="text-default-500">
              Prefetched routes are stored in an LRU (Least Recently Used) cache with a maximum size
              of 20 components. When the cache is full, the least recently used component is evicted
              to make room for new ones.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Cache Timeout</h3>
            <p className="text-default-500">
              Cached components expire after 5 minutes (300,000ms) to ensure users don't see stale
              content. Expired entries are automatically removed from the cache.
            </p>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6 bg-primary-50 dark:bg-primary-950">
        <h2 className="text-xl font-semibold mb-4">Benefits</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Instant Navigation:</strong> Prefetched routes load instantly, eliminating
              loading spinners and improving perceived performance.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Smart Caching:</strong> LRU eviction ensures memory usage stays bounded while
              keeping frequently accessed routes cached.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Error Resilience:</strong> Failed prefetches fall back to on-demand loading,
              so users never see errors from prefetch failures.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Flexible Strategies:</strong> Choose the right strategy for each link based on
              user behavior patterns and route importance.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
