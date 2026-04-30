/**
 * Realtime Demo Page
 *
 * Demonstrates @stackra/ts-realtime features:
 * - `RealtimeFacade` — get the realtime manager
 * - Connection status display (connected/disconnected/reconnecting)
 * - Channel subscription UI (subscribe/unsubscribe)
 * - Event listener with live log of received events
 * - Graceful error handling when not configured
 *
 * @module pages/demos/ts-realtime
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { RealtimeFacade } from "@stackra/ts-realtime";
import { Card, Button, Input, Chip, TextField, Label } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a single event log entry.
 */
interface EventLogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
  /** Entry type for color coding */
  type: "info" | "event" | "error" | "system";
}

/**
 * Connection status type.
 */
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";

/**
 * TsRealtimeDemo — interactive demo of the realtime WebSocket package.
 *
 * Users can connect to a Soketi/Pusher server, subscribe to channels,
 * listen for events, and see a live log of activity.
 *
 * @returns The realtime demo page
 */
export default function TsRealtimeDemo() {
  const [logs, setLogs] = useState<EventLogEntry[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [channelName, setChannelName] = useState("chat-room");
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const unsubscribersRef = useRef<Map<string, () => void>>(new Map());

  /**
   * Clean up all subscriptions on unmount.
   */
  useEffect(() => {
    return () => {
      for (const unsub of unsubscribersRef.current.values()) {
        try {
          unsub();
        } catch {
          // Channel may already be unsubscribed
        }
      }
    };
  }, []);

  /**
   * Append a message to the event log.
   *
   * @param message - The message to display
   * @param type - The entry type for color coding
   */
  const addLog = useCallback((message: string, type: EventLogEntry["type"] = "system") => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  }, []);

  /**
   * Attempt to connect to the WebSocket server.
   */
  const handleConnect = useCallback(() => {
    try {
      setStatus("connecting");
      addLog("Connecting to WebSocket server...");

      const realtime = RealtimeFacade;

      // Attempt connection — will fail gracefully if not configured
      realtime.connect();
      setStatus("connected");
      addLog("Connected to WebSocket server.", "info");
    } catch (err) {
      setStatus("error");
      addLog(`Connection failed: ${err instanceof Error ? err.message : String(err)}`, "error");
      addLog("Make sure VITE_PUSHER_APP_KEY and VITE_PUSHER_HOST are set in .env", "system");
    }
  }, [addLog]);

  /**
   * Disconnect from the WebSocket server.
   */
  const handleDisconnect = useCallback(() => {
    try {
      RealtimeFacade.disconnect();
      setStatus("disconnected");
      setSubscribedChannels([]);
      unsubscribersRef.current.clear();
      addLog("Disconnected from WebSocket server.");
    } catch (err) {
      addLog(`Disconnect error: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }, [addLog]);

  /**
   * Subscribe to a channel and listen for all events.
   */
  const handleSubscribe = useCallback(() => {
    if (!channelName) return;

    try {
      const channel = RealtimeFacade.channel(channelName);

      // Listen for a generic "message" event on the channel
      channel.listen("message", (data: unknown) => {
        addLog(`[${channelName}] message: ${JSON.stringify(data)}`, "event");
      });

      // Listen for any event on the channel
      channel.listen(".client-event", (data: unknown) => {
        addLog(`[${channelName}] client-event: ${JSON.stringify(data)}`, "event");
      });

      const unsub = () => {
        try {
          RealtimeFacade.leave(channelName);
        } catch {
          // Already left
        }
      };

      unsubscribersRef.current.set(channelName, unsub);
      setSubscribedChannels((prev) => [...prev, channelName]);
      addLog(`Subscribed to channel: ${channelName}`, "info");
    } catch (err) {
      addLog(`Subscribe error: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  }, [channelName, addLog]);

  /**
   * Unsubscribe from a specific channel.
   *
   * @param name - The channel name to unsubscribe from
   */
  const handleUnsubscribe = useCallback(
    (name: string) => {
      try {
        const unsub = unsubscribersRef.current.get(name);

        if (unsub) {
          unsub();
          unsubscribersRef.current.delete(name);
        }

        setSubscribedChannels((prev) => prev.filter((ch) => ch !== name));
        addLog(`Unsubscribed from channel: ${name}`, "info");
      } catch (err) {
        addLog(`Unsubscribe error: ${err instanceof Error ? err.message : String(err)}`, "error");
      }
    },
    [addLog],
  );

  /**
   * Get the color for the connection status chip.
   *
   * @param s - The connection status
   * @returns HeroUI chip color
   */
  const getStatusColor = (s: ConnectionStatus): "success" | "warning" | "danger" | "default" => {
    switch (s) {
      case "connected":
        return "success";
      case "connecting":
      case "reconnecting":
        return "warning";
      case "error":
        return "danger";
      default:
        return "default";
    }
  };

  /**
   * Get the color class for a log entry type.
   *
   * @param type - The log entry type
   * @returns Tailwind text color class
   */
  const getLogColor = (type: EventLogEntry["type"]): string => {
    switch (type) {
      case "info":
        return "text-blue-500";
      case "event":
        return "text-green-500";
      case "error":
        return "text-red-500";
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
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-realtime</h1>
          <p className="mt-1 text-muted">
            WebSocket real-time events via Soketi/Pusher with channel subscriptions.
          </p>
        </div>

        {/* ── Connection Status ─────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>1. Connection</Card.Title>
            <Card.Description>
              Connect to a Soketi/Pusher-compatible WebSocket server.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted">Status:</span>
              <Chip color={getStatusColor(status)} size="sm">
                {status}
              </Chip>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                isDisabled={status === "connected" || status === "connecting"}
                onPress={handleConnect}
              >
                Connect
              </Button>
              <Button
                isDisabled={status === "disconnected"}
                variant="outline"
                onPress={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* ── Environment Variables ─────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Environment Setup</Card.Title>
            <Card.Description>
              Required environment variables for WebSocket connection.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
              {`# .env
VITE_PUSHER_APP_KEY=your-app-key
VITE_PUSHER_HOST=localhost
VITE_PUSHER_PORT=6001
VITE_PUSHER_SCHEME=ws
VITE_PUSHER_CLUSTER=mt1
VITE_PUSHER_FORCE_TLS=false`}
            </pre>
          </Card.Content>
        </Card>

        {/* ── Channel Subscription ─────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>2. Subscribe to Channels</Card.Title>
            <Card.Description>
              Subscribe to named channels to receive real-time events.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <TextField
                  name="channel-name"
                  value={channelName}
                  onChange={(v) => setChannelName(v)}
                >
                  <Label>Channel Name</Label>
                  <Input placeholder="e.g. chat-room, notifications" />
                </TextField>
              </div>
              <div className="flex items-end">
                <Button
                  isDisabled={status !== "connected" || !channelName}
                  onPress={handleSubscribe}
                >
                  Subscribe
                </Button>
              </div>
            </div>
            {subscribedChannels.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted">Subscribed:</span>
                {subscribedChannels.map((ch) => (
                  <Chip key={ch} color="success" size="sm">
                    {ch}
                    <button
                      className="ml-1 text-xs opacity-70 hover:opacity-100"
                      onClick={() => handleUnsubscribe(ch)}
                    >
                      ✕
                    </button>
                  </Chip>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* ── Code Example ─────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Code Pattern</Card.Title>
          </Card.Header>
          <Card.Content>
            <pre className="bg-accent/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-foreground">
              {`import { RealtimeFacade } from "@stackra/ts-realtime";

// Connect to the WebSocket server
RealtimeFacade.connect();

// Subscribe to a channel
const channel = RealtimeFacade.channel("chat-room");

// Listen for events on the channel
channel.listen("message", (data) => {
  console.log("New message:", data);
});

// Listen for presence events
channel.listen(".client-typing", (data) => {
  console.log("User typing:", data);
});

// Leave a channel
RealtimeFacade.leave("chat-room");

// Disconnect
RealtimeFacade.disconnect();`}
            </pre>
          </Card.Content>
        </Card>

        {/* ── Event Log ────────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Event Log</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="mb-3">
              <Button variant="outline" onPress={() => setLogs([])}>
                Clear Log
              </Button>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 font-mono text-sm max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <span className="text-muted">
                  Connect and subscribe to a channel to see events...
                </span>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-muted">[{entry.time}]</span>{" "}
                    <span className={getLogColor(entry.type)}>{entry.message}</span>
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
