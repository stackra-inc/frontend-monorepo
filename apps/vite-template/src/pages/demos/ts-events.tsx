/**
 * Events Demo Page
 *
 * Demonstrates @stackra/ts-events features:
 * - `EventFacade.dispatch(name, payload)` — fire an event
 * - `EventFacade.listen(name, callback)` — subscribe to events
 * - Wildcard listeners with `user.*` patterns
 * - Interactive pub/sub pattern in the browser
 *
 * @module pages/demos/ts-events
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { EventFacade } from "@stackra/ts-events";
import { Card, Button, TextField, Input, Label, Chip } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

/**
 * Represents a received event in the log.
 */
interface EventLogEntry {
  /** Timestamp label */
  time: string;
  /** The event name that was received */
  eventName: string;
  /** The payload data */
  payload: string;
  /** Whether this was from a wildcard listener */
  isWildcard: boolean;
}

/**
 * TsEventsDemo — interactive event dispatching demo.
 *
 * Users can register listeners (including wildcards), dispatch events
 * with custom payloads, and see a live log of received events.
 *
 * @returns The events demo page
 */
export default function TsEventsDemo() {
  const [eventName, setEventName] = useState("user.created");
  const [payload, setPayload] = useState('{"id":1,"name":"Alice"}');
  const [listenerPattern, setListenerPattern] = useState("user.*");
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [listeners, setListeners] = useState<string[]>([]);
  const unsubscribersRef = useRef<Array<() => void>>([]);

  /**
   * Clean up all listeners on unmount.
   */
  useEffect(() => {
    return () => {
      for (const unsub of unsubscribersRef.current) {
        try {
          unsub();
        } catch {
          // Listener may already be removed
        }
      }
    };
  }, []);

  /**
   * Register a new event listener.
   */
  const handleListen = useCallback(() => {
    try {
      const pattern = listenerPattern;
      const events = EventFacade.dispatcher();
      const isWildcard = pattern.split("").includes("*");

      const unsubscribe = events.listen(pattern, (data: unknown) => {
        setEventLog((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            eventName: pattern,
            payload: JSON.stringify(data),
            isWildcard,
          },
        ]);
      });

      unsubscribersRef.current.push(unsubscribe);
      setListeners((prev) => [...prev, pattern]);
    } catch (err) {
      setEventLog((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          eventName: "error",
          payload: err instanceof Error ? err.message : String(err),
          isWildcard: false,
        },
      ]);
    }
  }, [listenerPattern]);

  /**
   * Dispatch an event with the given name and payload.
   */
  const handleDispatch = useCallback(() => {
    try {
      let parsedPayload: unknown;

      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        parsedPayload = payload;
      }

      EventFacade.dispatcher().dispatch(eventName, parsedPayload);

      setEventLog((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          eventName: `→ DISPATCHED: ${eventName}`,
          payload: JSON.stringify(parsedPayload),
          isWildcard: false,
        },
      ]);
    } catch (err) {
      setEventLog((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          eventName: "error",
          payload: err instanceof Error ? err.message : String(err),
          isWildcard: false,
        },
      ]);
    }
  }, [eventName, payload]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-events</h1>
          <p className="mt-1 text-muted">Pub/sub event dispatching with wildcard listeners.</p>
        </div>

        {/* ── Register Listener ────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>1. Register a Listener</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1">
                <TextField
                  name="listener-pattern"
                  value={listenerPattern}
                  onChange={(v) => setListenerPattern(v)}
                >
                  <Label>Event Pattern</Label>
                  <Input placeholder="e.g. user.* or order.placed" />
                </TextField>
              </div>
              <div className="flex items-end">
                <Button onPress={handleListen}>Listen</Button>
              </div>
            </div>
            {listeners.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted">Active listeners:</span>
                {listeners.map((l, i) => (
                  <Chip key={i} color="accent" size="sm">
                    {l}
                  </Chip>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* ── Dispatch Event ───────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>2. Dispatch an Event</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <TextField name="event-name" value={eventName} onChange={(v) => setEventName(v)}>
                <Label>Event Name</Label>
                <Input placeholder="e.g. user.created" />
              </TextField>
              <TextField name="event-payload" value={payload} onChange={(v) => setPayload(v)}>
                <Label>Payload (JSON)</Label>
                <Input placeholder='{"key":"value"}' />
              </TextField>
            </div>
            <div className="flex gap-3">
              <Button onPress={handleDispatch}>Dispatch</Button>
              <Button variant="outline" onPress={() => setEventLog([])}>
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
              {`import { EventFacade } from "@stackra/ts-events";

// Get the default dispatcher (EventService)
const events = EventFacade.dispatcher();

// Listen to a specific event
events.listen("user.created", (data) => {
  console.log("New user:", data);
});

// Wildcard listener — matches user.created, user.updated, etc.
events.listen("user.*", (data) => {
  console.log("User event:", data);
});

// Dispatch an event
events.dispatch("user.created", {
  id: 1,
  name: "Alice",
});`}
            </pre>
          </Card.Content>
        </Card>

        {/* ── Event Log ────────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Event Log</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="bg-accent/10 rounded-lg p-4 font-mono text-sm max-h-80 overflow-y-auto">
              {eventLog.length === 0 ? (
                <span className="text-muted">
                  Register a listener, then dispatch an event to see it here...
                </span>
              ) : (
                eventLog.map((entry, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-muted">[{entry.time}]</span>{" "}
                    <span className={entry.isWildcard ? "text-accent" : "text-foreground"}>
                      {entry.eventName}
                    </span>{" "}
                    <span className="text-muted">{entry.payload}</span>
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
