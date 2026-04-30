/**
 * Cache Demo Page
 *
 * Demonstrates @stackra/ts-cache features:
 * - `CacheFacade.store()` to get the default (memory) store
 * - `put(key, value, ttl)` — store a value with TTL
 * - `get(key)` — retrieve a cached value
 * - `remember(key, ttl, callback)` — cache-aside pattern
 * - `forget(key)` — remove a single key
 * - `flush()` — clear all cached values
 *
 * @module pages/demos/ts-cache
 */

import { useState, useCallback } from "react";
import { CacheFacade } from "@stackra/ts-cache";
import { Card, Button, TextField, Input, Label } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a single log entry in the cache demo output.
 */
interface LogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
}

/**
 * TsCacheDemo — interactive cache operations demo.
 *
 * Provides input fields for key/value and buttons for each cache
 * operation. Results are displayed in a scrollable log.
 *
 * @returns The cache demo page
 */
export default function TsCacheDemo() {
  const [key, setKey] = useState("user:1");
  const [value, setValue] = useState('{"name":"Alice","role":"admin"}');
  const [ttl, setTtl] = useState("300");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  /**
   * Append a message to the log output.
   *
   * @param message - The message to log
   */
  const log = useCallback((message: string) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  /**
   * Store a value in cache using `put()`.
   */
  const handlePut = useCallback(async () => {
    try {
      const cache = CacheFacade.store();

      await cache.put(key, value, Number(ttl));
      log(`PUT "${key}" → ${value} (TTL: ${ttl}s)`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [key, value, ttl, log]);

  /**
   * Retrieve a value from cache using `get()`.
   */
  const handleGet = useCallback(async () => {
    try {
      const cache = CacheFacade.store();
      const result = await cache.get(key);

      log(`GET "${key}" → ${result !== undefined ? String(result) : "undefined (miss)"}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [key, log]);

  /**
   * Use the cache-aside pattern with `remember()`.
   */
  const handleRemember = useCallback(async () => {
    try {
      const cache = CacheFacade.store();
      const result = await cache.remember(key, Number(ttl), () => {
        log(`  ↳ Cache miss — executing callback for "${key}"`);

        return `computed-at-${String(Date.now())}`;
      });

      log(`REMEMBER "${key}" → ${String(result)}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [key, ttl, log]);

  /**
   * Remove a single key from cache using `forget()`.
   */
  const handleForget = useCallback(async () => {
    try {
      const cache = CacheFacade.store();

      await cache.forget(key);
      log(`FORGET "${key}" — removed`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [key, log]);

  /**
   * Clear all cached values using `flush()`.
   */
  const handleFlush = useCallback(async () => {
    try {
      const cache = CacheFacade.store();

      await cache.flush();
      log("FLUSH — all cache entries cleared");
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [log]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-cache</h1>
          <p className="mt-1 text-muted">
            In-memory cache with put, get, remember, forget, and flush.
          </p>
        </div>

        {/* ── Input Fields ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Cache Operations</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <TextField name="cache-key" value={key} onChange={(v) => setKey(v)}>
                <Label>Key</Label>
                <Input placeholder="cache key" />
              </TextField>
              <TextField name="cache-value" value={value} onChange={(v) => setValue(v)}>
                <Label>Value</Label>
                <Input placeholder="value to store" />
              </TextField>
              <TextField name="cache-ttl" value={ttl} onChange={(v) => setTtl(v)}>
                <Label>TTL (seconds)</Label>
                <Input placeholder="300" />
              </TextField>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onPress={handlePut}>put()</Button>
              <Button onPress={handleGet}>get()</Button>
              <Button onPress={handleRemember}>remember()</Button>
              <Button onPress={handleForget}>forget()</Button>
              <Button variant="danger" onPress={handleFlush}>
                flush()
              </Button>
              <Button variant="outline" onPress={() => setLogs([])}>
                Clear Log
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* ── Code Example ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Code Pattern</Card.Title>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
              {`import { CacheFacade } from "@stackra/ts-cache";

const cache = CacheFacade.store(); // default memory store

// Store a value with 5-minute TTL
await cache.put("user:1", { name: "Alice" }, 300);

// Retrieve it
const user = await cache.get("user:1");

// Cache-aside: fetch on miss, cache the result
const data = await cache.remember("key", 3600, async () => {
  return await fetchExpensiveData();
});

// Remove a single key
await cache.forget("user:1");

// Clear everything
await cache.flush();`}
            </pre>
          </Card.Content>
        </Card>

        {/* ── Output Log ───────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Output</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="bg-accent/10 rounded-lg p-4 font-mono text-sm max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <span className="text-muted">
                  Use the buttons above to interact with the cache...
                </span>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-muted">[{entry.time}]</span>{" "}
                    <span className="text-foreground">{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>
      </section>
    </DefaultLayout>
  );
}
