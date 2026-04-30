/**
 * Logger Demo Page
 *
 * Demonstrates @stackra/ts-logger features:
 * - `LogFacade.channel(name)` — get a logger channel
 * - `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()` — log at different levels
 * - Channel switching (console, storage, combined, errors)
 * - Context data in log messages
 * - Interactive UI with buttons for each log level and scrollable log output
 *
 * @module pages/demos/ts-logger
 */

import { useState, useCallback } from "react";
import { LogFacade } from "@stackra/ts-logger";
import { Card, Button, Chip } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a single log entry in the demo output.
 */
interface LogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
  /** Log level for color coding */
  level: "info" | "warn" | "error" | "debug" | "system";
}

/**
 * Available logger channels defined in logger.config.ts.
 */
const CHANNELS = ["console", "storage", "combined", "errors"] as const;

/**
 * TsLoggerDemo — interactive demo of the multi-channel logger.
 *
 * Users can switch channels, log at different levels with context data,
 * and see a live log of all operations.
 *
 * @returns The logger demo page
 */
export default function TsLoggerDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>("console");

  /**
   * Append a message to the demo log output.
   *
   * @param message - The message to display
   * @param level - The log level for color coding
   */
  const addLog = useCallback((message: string, level: LogEntry["level"] = "system") => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message, level }]);
  }, []);

  /**
   * Log an info-level message on the active channel.
   */
  const handleInfo = useCallback(() => {
    try {
      const logger = LogFacade.channel(activeChannel);

      logger.info("User navigated to dashboard", { userId: 42, page: "/dashboard" });
      addLog(`[${activeChannel}] INFO: User navigated to dashboard { userId: 42 }`, "info");
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }, [activeChannel, addLog]);

  /**
   * Log a warn-level message on the active channel.
   */
  const handleWarn = useCallback(() => {
    try {
      const logger = LogFacade.channel(activeChannel);

      logger.warn("API response slow", { endpoint: "/api/users", latency: 2300 });
      addLog(`[${activeChannel}] WARN: API response slow { latency: 2300ms }`, "warn");
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }, [activeChannel, addLog]);

  /**
   * Log an error-level message on the active channel.
   */
  const handleError = useCallback(() => {
    try {
      const logger = LogFacade.channel(activeChannel);

      logger.error("Failed to fetch user profile", {
        userId: 42,
        status: 500,
        message: "Internal Server Error",
      });
      addLog(`[${activeChannel}] ERROR: Failed to fetch user profile { status: 500 }`, "error");
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }, [activeChannel, addLog]);

  /**
   * Log a debug-level message on the active channel.
   */
  const handleDebug = useCallback(() => {
    try {
      const logger = LogFacade.channel(activeChannel);

      logger.debug("Cache lookup", { key: "user:42", hit: false, store: "memory" });
      addLog(`[${activeChannel}] DEBUG: Cache lookup { key: "user:42", hit: false }`, "debug");
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }, [activeChannel, addLog]);

  /**
   * Get the color class for a log level.
   *
   * @param level - The log level
   * @returns Tailwind text color class
   */
  const getLevelColor = (level: LogEntry["level"]): string => {
    switch (level) {
      case "info":
        return "text-blue-500";
      case "warn":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      case "debug":
        return "text-green-500";
      default:
        return "text-muted";
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-logger</h1>
          <p className="mt-1 text-muted">
            Multi-channel logging with console, storage, and combined transporters.
          </p>
        </div>

        {/* ── Channel Selector ─────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>1. Select Channel</Card.Title>
            <Card.Description>
              Each channel has different transporters (console, storage, or both).
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-wrap gap-3">
              {CHANNELS.map((channel) => (
                <Button
                  key={channel}
                  variant={activeChannel === channel ? "primary" : "outline"}
                  onPress={() => {
                    setActiveChannel(channel);
                    addLog(`Switched to channel: ${channel}`);
                  }}
                >
                  {channel}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-muted">Active channel:</span>
              <Chip color="accent" size="sm">
                {activeChannel}
              </Chip>
            </div>
          </Card.Content>
        </Card>

        {/* ── Log Actions ──────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>2. Log Messages</Card.Title>
            <Card.Description>
              Each button logs a message at a different level with context data.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-wrap gap-3">
              <Button onPress={handleInfo}>ℹ️ Info</Button>
              <Button onPress={handleWarn}>⚠️ Warn</Button>
              <Button variant="danger" onPress={handleError}>
                ❌ Error
              </Button>
              <Button onPress={handleDebug}>🐛 Debug</Button>
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
              {`import { LogFacade } from "@stackra/ts-logger";

// Get a logger channel (console, storage, combined, errors)
const logger = LogFacade.channel("console");

// Log at different levels with context data
logger.info("User logged in", { userId: 42 });
logger.warn("Slow query detected", { query: "SELECT *", ms: 2300 });
logger.error("Payment failed", { orderId: "ORD-123", status: 500 });
logger.debug("Cache miss", { key: "user:42", store: "memory" });

// Switch channels at runtime
const errorLogger = LogFacade.channel("errors");
errorLogger.error("Critical failure", { service: "auth" });`}
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
                  Select a channel and click a log level button to start...
                </span>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-muted">[{entry.time}]</span>{" "}
                    <span className={getLevelColor(entry.level)}>{entry.message}</span>
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
