/**
 * @fileoverview Cache & Keep-Alive Demo Route
 *
 * Demonstrates route caching with component state and scroll position preservation.
 * Shows how keepAlive routes maintain their state when navigating away and back.
 */

import React, { useState, useEffect } from "react";
import { Route, AppLink, useRouteCache } from "@stackra/react-router";
import { Button, Card, Input, TextArea, Badge, Switch, Label } from "@heroui/react";
import { Trash2, Archive, RefreshCw } from "lucide-react";

/**
 * Cache Demo Route with keepAlive enabled
 *
 * This route's state and scroll position will be preserved when navigating away.
 */
@Route({
  path: "/demos/features/cache",
  label: "Route Caching",
  variant: "main",
  parent: "/demos",
  order: 22,
  keepAlive: true,
  meta: {
    title: "Route Caching Demo",
    description: "Demonstrates route caching with state and scroll preservation",
  },
})
export class CacheDemoRoute {
  render() {
    return <CacheDemoPage />;
  }
}

/**
 * Cache Demo Page Component
 *
 * Maintains form state and scroll position across navigation.
 */
function CacheDemoPage() {
  useRouteCache();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [counter, setCounter] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);

  /**
   * Update cache keys on mount
   */
  useEffect(() => {
    // getCacheKeys not available on UseRouteCacheReturn
  }, []);

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle cache clear
   */
  const handleClearCache = () => {
    // clearCache not available on UseRouteCacheReturn
    setCacheKeys([]);
  };

  /**
   * Handle cache clear for specific route
   */
  const handleClearRouteCache = (_key: string) => {
    // clearCache not available on UseRouteCacheReturn
    setCacheKeys([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Route Caching Demo</h1>
        <p className="text-default-500">
          This route has <Badge color="accent">keepAlive: true</Badge> — state and scroll position
          are preserved
        </p>
      </div>

      {/* Cache Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Cache Status</h2>
            <p className="text-sm text-default-500">
              Cached routes: <Badge color="accent">{cacheKeys.length}</Badge>
            </p>
          </div>
          <Button variant="ghost" onPress={handleClearCache} isDisabled={cacheKeys.length === 0}>
            <Trash2 className="w-4 h-4" />
            Clear All Cache
          </Button>
        </div>

        {cacheKeys.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Cached Routes:</h3>
            {cacheKeys.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 bg-default-100 rounded-lg"
              >
                <code className="text-xs">{key}</code>
                <Button size="sm" variant="ghost" onPress={() => handleClearRouteCache(key)}>
                  Clear
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Interactive State Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Interactive State</h2>
        <p className="text-sm text-default-500 mb-4">
          Interact with these controls, navigate away, then come back. Your state will be preserved!
        </p>

        <div className="space-y-4">
          {/* Counter */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Counter</label>
            <div className="flex items-center gap-4">
              <Button onPress={() => setCounter((c) => c - 1)}>-</Button>
              <Badge color="accent" size="lg">
                {counter}
              </Badge>
              <Button onPress={() => setCounter((c) => c + 1)}>+</Button>
              <Button variant="ghost" onPress={() => setCounter(0)}>
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Toggle */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Toggle Switch</label>
            <Switch isSelected={isEnabled} onChange={setIsEnabled}>
              {isEnabled ? "Enabled" : "Disabled"}
            </Switch>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("name", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("email", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Message</Label>
              <TextArea
                placeholder="Enter your message"
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("message", e.target.value)
                }
                rows={4}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Test */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test Cache Behavior</h2>
        <p className="text-sm text-default-500 mb-4">
          Navigate to another route and come back to see your state preserved:
        </p>
        <div className="flex flex-wrap gap-3">
          <AppLink
            to="/demos/router/prefetch"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to Prefetch Demo
          </AppLink>
          <AppLink
            to="/demos/features/middleware"
            className="inline-block px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-600 transition-colors"
          >
            Go to Middleware Demo
          </AppLink>
          <AppLink
            to="/demos/features/query-params"
            className="inline-block px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning-600 transition-colors"
          >
            Go to Query Params Demo
          </AppLink>
        </div>
      </Card>

      {/* Scroll Position Test */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Scroll Position Preservation</h2>
        <p className="text-sm text-default-500 mb-4">
          Scroll down this page, navigate away, then come back. Your scroll position will be
          restored!
        </p>
        <div className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 bg-default-100 rounded-lg">
              <h3 className="font-semibold">Section {i + 1}</h3>
              <p className="text-sm text-default-500">
                This is section {i + 1}. Scroll down to see more sections, then navigate away and
                come back to test scroll restoration.
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Component State Preservation</h3>
            <p className="text-default-500">
              When <code>keepAlive: true</code> is set, the route's component instance is cached in
              memory. React state, refs, and context values are all preserved.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Scroll Position Restoration</h3>
            <p className="text-default-500">
              The scroll position is saved when navigating away and restored when returning. This
              happens automatically with a 50ms delay to ensure the DOM is ready.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Cache Storage</h3>
            <p className="text-default-500">
              Route cache uses <code>@stackra/ts-cache</code> as the underlying storage layer. Cache
              keys are namespaced with <code>route:</code> prefix to avoid conflicts.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Memory Management</h3>
            <p className="text-default-500">
              Cached components stay in memory until explicitly cleared or the page is refreshed.
              Use the cache management API to clear specific routes or all cached routes.
            </p>
          </div>
        </div>
      </Card>

      {/* Use Cases */}
      <Card className="p-6 bg-primary-50 dark:bg-primary-950">
        <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Archive className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Form Preservation:</strong> Keep form data when users navigate away
              temporarily (e.g., to check documentation or reference data).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Archive className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>List Scroll Position:</strong> Preserve scroll position in long lists when
              users navigate to detail pages and back.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Archive className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Tab State:</strong> Maintain active tab selection and tab content state across
              navigation.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Archive className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              <strong>Filter State:</strong> Keep search filters and sort options when navigating
              between search results and detail views.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
