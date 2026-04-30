/**
 * Redis Demo Page
 *
 * Demonstrates @stackra/ts-redis features:
 * - Upstash Redis HTTP API (browser-compatible)
 * - SET, GET, DEL operations
 * - Connection status detection
 * - Graceful error handling when credentials are not configured
 *
 * Redis requires Upstash credentials (VITE_UPSTASH_REDIS_REST_URL
 * and VITE_UPSTASH_REDIS_REST_TOKEN) to be set in the environment.
 *
 * @module pages/demos/ts-redis
 */

import { useState, useCallback, useEffect } from "react";
import { RedisFacade } from "@stackra/ts-redis";
import { Card, Button, TextField, Input, Label, Chip } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a single log entry in the Redis demo output.
 */
interface LogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
  /** Whether this is an error entry */
  isError?: boolean;
}

/**
 * TsRedisDemo — interactive Redis operations demo.
 *
 * Shows SET/GET/DEL operations against Upstash Redis.
 * Gracefully handles the case where credentials are not configured.
 *
 * @returns The Redis demo page
 */
export default function TsRedisDemo() {
  const [key, setKey] = useState("demo:greeting");
  const [value, setValue] = useState("Hello from the browser!");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  /**
   * Append a message to the log output.
   *
   * @param message - The message to log
   * @param isError - Whether this is an error message
   */
  const log = useCallback((message: string, isError = false) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message, isError }]);
  }, []);

  /**
   * Check if Redis credentials are configured on mount.
   */
  useEffect(() => {
    const url = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
    const token = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

    setIsConfigured(Boolean(url && token));
  }, []);

  /**
   * Execute a SET command.
   */
  const handleSet = useCallback(async () => {
    log(`SET "${key}" → "${value}"`);
    try {
      const connection = await RedisFacade.connection();

      await connection.set(key, value);
      log("SET OK");
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    }
  }, [key, value, log]);

  /**
   * Execute a GET command.
   */
  const handleGet = useCallback(async () => {
    log(`GET "${key}"`);
    try {
      const connection = await RedisFacade.connection();
      const result = await connection.get(key);

      log(`Result: ${result !== null ? String(result) : "null (key not found)"}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    }
  }, [key, log]);

  /**
   * Execute a DEL command.
   */
  const handleDel = useCallback(async () => {
    log(`DEL "${key}"`);
    try {
      const connection = await RedisFacade.connection();
      const result = await connection.del(key);

      log(`Deleted ${String(result)} key(s)`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    }
  }, [key, log]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-redis</h1>
          <p className="mt-1 text-muted">
            Upstash Redis HTTP client — browser-compatible key/value operations.
          </p>
        </div>

        {/* ── Connection Status ─────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Connection Status</Card.Title>
          </Card.Header>
          <Card.Content>
            {isConfigured === null ? (
              <p className="text-muted">Checking credentials...</p>
            ) : isConfigured ? (
              <div className="flex items-center gap-2">
                <Chip color="success">Connected</Chip>
                <span className="text-foreground">
                  Upstash credentials configured — ready to use.
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Chip color="warning">Not Configured</Chip>
                  <span className="text-foreground">Upstash credentials not configured.</span>
                </div>
                <p className="text-sm text-muted mb-2">
                  To enable Redis operations, add these to your{" "}
                  <code className="px-1 py-0.5 rounded bg-accent/10 font-mono text-xs">.env</code>{" "}
                  file:
                </p>
                <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
                  {`VITE_UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
VITE_UPSTASH_REDIS_REST_TOKEN=your-token-here`}
                </pre>
                <p className="mt-2 text-xs text-muted">
                  Get free credentials at{" "}
                  <a
                    className="text-accent hover:underline"
                    href="https://upstash.com"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    upstash.com
                  </a>
                  . The operations below will show errors until configured.
                </p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* ── Operations ───────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Redis Operations</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <TextField name="redis-key" value={key} onChange={(v) => setKey(v)}>
                <Label>Key</Label>
                <Input placeholder="redis key" />
              </TextField>
              <TextField name="redis-value" value={value} onChange={(v) => setValue(v)}>
                <Label>Value</Label>
                <Input placeholder="value to store" />
              </TextField>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onPress={handleSet}>SET</Button>
              <Button onPress={handleGet}>GET</Button>
              <Button variant="danger" onPress={handleDel}>
                DEL
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
              {`import { RedisFacade } from "@stackra/ts-redis";

// Get the default connection (Upstash HTTP) — async
const redis = await RedisFacade.connection();

// SET a value
await redis.set("greeting", "Hello!");

// GET a value
const value = await redis.get("greeting");
// → "Hello!"

// DEL a key
await redis.del("greeting");

// Uses Upstash REST API — works in the browser.
// No TCP sockets needed, fully HTTP-based.`}
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
                <span className="text-muted">Use the buttons above to interact with Redis...</span>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-muted">[{entry.time}]</span>{" "}
                    <span className={entry.isError ? "text-danger" : "text-foreground"}>
                      {entry.message}
                    </span>
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
