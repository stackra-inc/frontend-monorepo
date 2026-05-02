/**
 * @fileoverview History Demo Component
 *
 * This component demonstrates the history management system, showing how to:
 * - Navigate programmatically with push/replace
 * - Attach custom state to navigation actions
 * - Use back/forward/go navigation
 * - Check navigation availability (canGoBack, canGoForward)
 * - Track history stack length
 *
 * The demo provides interactive controls to test all history navigation
 * methods and see how they affect the browser's history stack.
 *
 * @module demos
 * @category Components
 */

import { useState, useEffect, type ReactElement } from "react";
import { Button, Card, Input, TextArea } from "@heroui/react";
import { useHistory, useLocation } from "@stackra/react-router";

/**
 * Demo component for history management.
 *
 * Provides an interactive interface to test all history navigation methods,
 * including push, replace, back, forward, and go. Shows the current history
 * state and allows attaching custom state objects to navigation actions.
 *
 * @component
 * @returns {React.ReactElement} The history demo UI
 */
export function HistoryDemoComponent(): ReactElement {
  const history = useHistory();
  const location = useLocation();

  // State for navigation inputs
  const [targetPath, setTargetPath] = useState("/demos");
  const [customState, setCustomState] = useState(
    JSON.stringify({ demo: true, timestamp: Date.now() }, null, 2),
  );
  const [goCount, setGoCount] = useState(-1);

  // State for history info
  const [historyLength, setHistoryLength] = useState(history.getLength());
  const [canGoBack, setCanGoBack] = useState(history.canGoBack());
  const [canGoForward, setCanGoForward] = useState(history.canGoForward());

  // State for navigation log
  const [navigationLog, setNavigationLog] = useState<string[]>([]);

  /**
   * Update history info on location change.
   * This runs whenever the user navigates.
   */
  useEffect(() => {
    setHistoryLength(history.getLength());
    setCanGoBack(history.canGoBack());
    setCanGoForward(history.canGoForward());

    // Log the navigation
    const logEntry = `Navigated to: ${location.pathname} (Length: ${history.getLength()})`;
    setNavigationLog((prev) => [...prev.slice(-9), logEntry]);
    // eslint-disable-next-line
  }, [location.pathname, location.search, location.hash]);

  /**
   * Parse custom state JSON.
   * Returns parsed object or null if invalid JSON.
   */
  const parseCustomState = (): Record<string, unknown> | null => {
    try {
      return JSON.parse(customState);
    } catch {
      return null;
    }
  };

  /**
   * Navigate using push method.
   */
  const handlePush = () => {
    const state = parseCustomState();
    if (state) {
      history.push(targetPath, state);
    } else {
      history.push(targetPath);
    }
  };

  /**
   * Navigate using replace method.
   */
  const handleReplace = () => {
    const state = parseCustomState();
    if (state) {
      history.replace(targetPath, state);
    } else {
      history.replace(targetPath);
    }
  };

  /**
   * Navigate using go method.
   */
  const handleGo = () => {
    history.go(goCount);
  };

  /**
   * Clear the navigation log.
   */
  const clearLog = () => {
    setNavigationLog([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">History Management Demo</h1>
        <p className="text-gray-600">
          Test browser history navigation with push, replace, back, forward, and go methods. Attach
          custom state to navigation actions and track history stack changes.
        </p>
      </div>

      {/* Current Location Info */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-3">Current Location</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="font-medium min-w-[120px]">Pathname:</span>
            <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-sm">
              {location.pathname}
            </code>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium min-w-[120px]">Search:</span>
            <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-sm">
              {location.search || "(none)"}
            </code>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium min-w-[120px]">Hash:</span>
            <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-sm">
              {location.hash || "(none)"}
            </code>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium min-w-[120px]">State:</span>
            <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-sm">
              {location.state ? JSON.stringify(location.state, null, 2) : "(none)"}
            </code>
          </div>
        </div>
      </Card>

      {/* History Stack Info */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-3">History Stack Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Stack Length</div>
            <div className="text-2xl font-bold text-blue-600">{historyLength}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Can Go Back</div>
            <div className="text-2xl font-bold text-green-600">{canGoBack ? "Yes" : "No"}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Can Go Forward</div>
            <div className="text-2xl font-bold text-purple-600">{canGoForward ? "Yes" : "No"}</div>
          </div>
        </div>
      </Card>

      {/* Push & Replace Navigation */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Push & Replace Navigation</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Path</label>
            <Input
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder="/path/to/navigate"
              className="max-w-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter a path to navigate to (e.g., /demos, /about, /demos/react-router)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Custom State (JSON)</label>
            <TextArea
              value={customState}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCustomState(e.target.value)
              }
              placeholder='{"key": "value"}'
              rows={4}
              className="max-w-md font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional JSON object to attach to the navigation. Must be valid JSON.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onPress={handlePush}>
              Push (Add to History)
            </Button>
            <Button variant="secondary" onPress={handleReplace}>
              Replace (Replace Current)
            </Button>
          </div>
        </div>
      </Card>

      {/* Back, Forward, Go Navigation */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">History Traversal</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onPress={() => history.back()} isDisabled={!canGoBack}>
              ← Back
            </Button>
            <Button variant="primary" onPress={() => history.forward()}>
              Forward →
            </Button>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">Go by Delta</label>
            <div className="flex items-center gap-3 max-w-md">
              <Input
                type="number"
                value={String(goCount)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGoCount(Number(e.target.value))
                }
                placeholder="-1"
                className="flex-1"
              />
              <Button variant="tertiary" onPress={handleGo}>
                Go
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Negative = back, Positive = forward, 0 = reload (e.g., -2 = back twice)
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation Log */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Navigation Log</h2>
          <Button size="sm" variant="danger" onPress={clearLog}>
            Clear Log
          </Button>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
          {navigationLog.length === 0 ? (
            <p className="text-gray-500 text-sm">No navigation events yet</p>
          ) : (
            <div className="space-y-1">
              {navigationLog.map((entry, index) => (
                <div key={index} className="text-sm font-mono text-gray-700">
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Navigation Buttons */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
        <p className="text-gray-600 mb-4">
          Use these buttons to quickly navigate to different routes and test history behavior.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onPress={() => history.push("/")}>
            Home
          </Button>
          <Button variant="secondary" onPress={() => history.push("/demos")}>
            Demos
          </Button>
          <Button variant="secondary" onPress={() => history.push("/about")}>
            About
          </Button>
          <Button variant="secondary" onPress={() => history.push("/demos/router/react-router")}>
            React Router Demo
          </Button>
          <Button
            variant="secondary"
            onPress={() =>
              history.push("/demos/features/history", {
                quickNav: true,
                timestamp: Date.now(),
              })
            }
          >
            This Page (with state)
          </Button>
        </div>
      </Card>

      {/* Code Examples */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-blue-600 mb-2">Basic Navigation</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { useHistory } from '@stackra/react-router';

function MyComponent() {
  const history = useHistory();

  // Navigate to a new route (adds to history)
  history.push('/about');

  // Navigate and replace current entry
  history.replace('/login');

  // Go back
  history.back();

  // Go forward
  history.forward();

  // Go by delta
  history.go(-2); // Back twice
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-green-600 mb-2">Navigation with State</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`// Push with custom state
history.push('/posts/42', {
  fromSearch: true,
  query: 'react hooks',
  timestamp: Date.now()
});

// Access state in destination route
const location = useLocation();
console.log(location.state); // { fromSearch: true, ... }`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-purple-600 mb-2">Conditional Navigation</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`// Safe back navigation with fallback
if (history.canGoBack()) {
  history.back();
} else {
  history.push('/'); // Go home if no history
}

// Check history depth
const depth = history.getLength();
if (depth > 2) {
  history.go(-2); // Go back twice
}`}</code>
            </pre>
          </div>
        </div>
      </Card>

      {/* Method Reference */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Method Reference</h2>
        <div className="space-y-3">
          <div>
            <code className="text-blue-600 bg-gray-100 px-2 py-1 rounded text-sm">
              push(path, state?)
            </code>
            <p className="text-sm text-gray-600 mt-1">
              Navigate to a new route, adding a new entry to the history stack. The user can press
              back to return to the previous route.
            </p>
          </div>
          <div>
            <code className="text-purple-600 bg-gray-100 px-2 py-1 rounded text-sm">
              replace(path, state?)
            </code>
            <p className="text-sm text-gray-600 mt-1">
              Navigate to a new route, replacing the current entry in the history stack. Pressing
              back will skip the current route.
            </p>
          </div>
          <div>
            <code className="text-green-600 bg-gray-100 px-2 py-1 rounded text-sm">back()</code>
            <p className="text-sm text-gray-600 mt-1">
              Navigate to the previous entry in the history stack. Equivalent to pressing the
              browser's back button.
            </p>
          </div>
          <div>
            <code className="text-green-600 bg-gray-100 px-2 py-1 rounded text-sm">forward()</code>
            <p className="text-sm text-gray-600 mt-1">
              Navigate to the next entry in the history stack. Only works if the user has previously
              navigated backward.
            </p>
          </div>
          <div>
            <code className="text-orange-600 bg-gray-100 px-2 py-1 rounded text-sm">go(delta)</code>
            <p className="text-sm text-gray-600 mt-1">
              Navigate by a specific number of entries. Negative values go backward, positive values
              go forward, 0 reloads the current page.
            </p>
          </div>
          <div>
            <code className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">canGoBack()</code>
            <p className="text-sm text-gray-600 mt-1">
              Returns true if there's at least one entry before the current one in the history
              stack.
            </p>
          </div>
          <div>
            <code className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">
              canGoForward()
            </code>
            <p className="text-sm text-gray-600 mt-1">
              Returns true if there's at least one entry after the current one in the history stack.
            </p>
          </div>
          <div>
            <code className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">getLength()</code>
            <p className="text-sm text-gray-600 mt-1">
              Returns the number of entries in the history stack (minimum 1).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
