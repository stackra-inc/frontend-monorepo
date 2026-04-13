"use client";

/**
 * @file app/events/page.tsx
 * @description Events package demo page.
 *
 * Interactive showcase of @abdokouta/ts-events:
 *   - dispatch() — fire events with payloads
 *   - listen() — register listeners with unsubscribe
 *   - once() — one-time listeners
 *   - until() — halt on first non-null response
 *   - Wildcard matching (*, **)
 *   - Priority ordering (CRITICAL → HIGH → NORMAL → LOW)
 *   - forget() / forgetAll() — remove listeners
 *   - hasListeners() / getListeners() — query listeners
 *   - asObservable() — RxJS stream
 *   - subscribe() — subscriber registration
 *   - destroy() — cleanup
 *   - EventService.dispatcher() — switch dispatchers
 *   - NullDispatcher — silenced dispatch for testing
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, Chip, Separator, Button } from "@heroui/react";
import { EventManager, MemoryDispatcher, NullDispatcher, EventPriority } from "@abdokouta/ts-events";
import type { EventDispatcherInterface } from "@abdokouta/ts-events";
import { useInject } from "@abdokouta/ts-container-react";
import { filter } from "rxjs";

import { title, subtitle } from "@/components/primitives";

// ── Types ───────────────────────────────────────────────────────────────────

interface LogEntry {
  id: number;
  type: "dispatch" | "listen" | "info" | "rxjs" | "error";
  message: string;
  detail?: string;
  timestamp: string;
}

const TYPE_COLORS: Record<string, "default" | "accent" | "warning" | "danger" | "success"> = {
  dispatch: "accent",
  listen: "success",
  info: "default",
  rxjs: "warning",
  error: "danger",
};

// ── Component ───────────────────────────────────────────────────────────────

export default function EventsPage() {
  const manager = useInject(EventManager);
  const events = manager.dispatcher();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);
  const unsubsRef = useRef<Array<() => void>>([]);

  const log = useCallback((type: LogEntry["type"], message: string, detail?: string) => {
    setLogs((prev) => [
      {
        id: ++idRef.current,
        type,
        message,
        detail,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 99),
    ]);
  }, []);

  // Cleanup all listeners on unmount.
  useEffect(() => {
    return () => {
      for (const unsub of unsubsRef.current) unsub();
    };
  }, []);

  // ── 1. dispatch() ─────────────────────────────────────────────────────

  function demoDispatch() {
    events.listen("user.created", (payload) => {
      const p = payload as { userId: string; email: string };
      log("listen", `Listener fired: user.created`, `userId=${p.userId}, email=${p.email}`);
    });

    const results = events.dispatch("user.created", {
      userId: "U-001",
      email: "alice@example.com",
    });

    log("dispatch", `dispatch('user.created')`, `Responses: ${JSON.stringify(results)}`);
    events.forget("user.created");
  }

  // ── 2. listen() + unsubscribe ─────────────────────────────────────────

  function demoListen() {
    const unsub = events.listen("order.placed", (payload) => {
      const p = payload as { orderId: string };
      log("listen", `Listener: order.placed → ${p.orderId}`);
    });

    events.dispatch("order.placed", { orderId: "ORD-001" });
    log("dispatch", `dispatch('order.placed') — listener active`);

    unsub();
    events.dispatch("order.placed", { orderId: "ORD-002" });
    log("info", `dispatch('order.placed') after unsub — no listener fired`);
  }

  // ── 3. once() ─────────────────────────────────────────────────────────

  function demoOnce() {
    events.once("app.first_launch", () => {
      log("listen", `once('app.first_launch') — fired!`);
    });

    events.dispatch("app.first_launch");
    log("dispatch", `dispatch('app.first_launch') — 1st time`);

    events.dispatch("app.first_launch");
    log("info", `dispatch('app.first_launch') — 2nd time (once removed, no fire)`);
  }

  // ── 4. until() ────────────────────────────────────────────────────────

  function demoUntil() {
    events.listen("resolve.handler", () => null);
    events.listen("resolve.handler", () => ({ handler: "PaymentHandler" }));
    events.listen("resolve.handler", () => ({ handler: "FallbackHandler" }));

    const result = events.until("resolve.handler", { type: "payment" });
    log("dispatch", `until('resolve.handler')`, `First responder: ${JSON.stringify(result)}`);
    events.forget("resolve.handler");
  }

  // ── 5. Wildcards ──────────────────────────────────────────────────────

  function demoWildcards() {
    const unsub = events.listen("user.*", (eventName, payload) => {
      log("listen", `Wildcard 'user.*' caught: ${eventName}`, JSON.stringify(payload));
    });

    events.dispatch("user.created", { userId: "1" });
    events.dispatch("user.deleted", { userId: "2" });
    events.dispatch("user.profile.updated", { userId: "3" });
    log("info", `'user.profile.updated' NOT caught by 'user.*' (two segments)`);

    unsub();
  }

  function demoDoubleWildcard() {
    const unsub = events.listen("order.**", (eventName, payload) => {
      log("listen", `Wildcard 'order.**' caught: ${eventName}`, JSON.stringify(payload));
    });

    events.dispatch("order.created", { id: "1" });
    events.dispatch("order.item.added", { id: "2" });
    events.dispatch("order.payment.processed", { id: "3" });

    unsub();
  }

  // ── 6. Priority ───────────────────────────────────────────────────────

  function demoPriority() {
    const order: string[] = [];

    const u1 = events.listen(
      "priority.test",
      () => {
        order.push("NORMAL");
      },
      EventPriority.NORMAL,
    );
    const u2 = events.listen(
      "priority.test",
      () => {
        order.push("CRITICAL");
      },
      EventPriority.CRITICAL,
    );
    const u3 = events.listen(
      "priority.test",
      () => {
        order.push("LOW");
      },
      EventPriority.LOW,
    );
    const u4 = events.listen(
      "priority.test",
      () => {
        order.push("HIGH");
      },
      EventPriority.HIGH,
    );

    events.dispatch("priority.test");
    log("dispatch", `Priority order`, order.join(" → "));

    u1();
    u2();
    u3();
    u4();
  }

  // ── 7. Stop propagation ───────────────────────────────────────────────

  function demoStopPropagation() {
    const u1 = events.listen("payment.check", () => {
      log("listen", `Listener 1: Fraud check — BLOCKED`);
      return false;
    });
    const u2 = events.listen("payment.check", () => {
      log("listen", `Listener 2: should NOT fire`);
    });

    events.dispatch("payment.check");
    log("info", `Listener 2 was skipped (return false stopped propagation)`);

    u1();
    u2();
  }

  // ── 8. forget / forgetAll / hasListeners ──────────────────────────────

  function demoForgetAndQuery() {
    events.listen("temp.a", () => {});
    events.listen("temp.b", () => {});

    log("info", `hasListeners('temp.a'): ${events.hasListeners("temp.a")}`);
    log("info", `getListeners('temp.a').length: ${events.getListeners("temp.a").length}`);

    events.forget("temp.a");
    log("info", `After forget('temp.a'): hasListeners = ${events.hasListeners("temp.a")}`);

    events.forgetAll();
    log("info", `After forgetAll(): hasListeners('temp.b') = ${events.hasListeners("temp.b")}`);
  }

  // ── 9. Object events ─────────────────────────────────────────────────

  function demoObjectEvents() {
    class UserRegistered {
      constructor(
        public userId: string,
        public email: string,
      ) {}
    }

    const unsub = events.listen("UserRegistered", (payload) => {
      const e = payload as UserRegistered;
      log("listen", `Object event: UserRegistered`, `userId=${e.userId}, email=${e.email}`);
    });

    events.dispatch(new UserRegistered("U-789", "new@example.com"));
    log("dispatch", `dispatch(new UserRegistered(...))`);

    unsub();
  }

  // ── 10. RxJS Observable ───────────────────────────────────────────────

  function demoRxJS() {
    const sub = events
      .asObservable()
      .pipe(filter((e) => e.event.startsWith("rxjs.")))
      .subscribe(({ event, payload }) => {
        log("rxjs", `RxJS stream: ${event}`, JSON.stringify(payload));
      });

    events.dispatch("rxjs.test1", { msg: "hello from RxJS" });
    events.dispatch("rxjs.test2", { msg: "second event" });
    events.dispatch("other.event", { msg: "filtered out" });

    log("info", `'other.event' was filtered out by RxJS pipe`);

    sub.unsubscribe();
  }

  // ── 11. NullDispatcher ────────────────────────────────────────────────

  function demoNullDispatcher() {
    const nullD = new NullDispatcher();

    nullD.listen("test.event", () => {
      log("error", `This should NOT appear`);
    });

    nullD.dispatch("test.event", { data: "silenced" });
    log(
      "info",
      `NullDispatcher: dispatch silenced, hasListeners = ${nullD.hasListeners("test.event")}`,
    );

    nullD.destroy();
  }

  // ── 12. Standalone MemoryDispatcher ───────────────────────────────────

  function demoStandaloneDispatcher() {
    const d = new MemoryDispatcher({ wildcards: true });

    d.listen("standalone.*", (eventName, payload) => {
      log("listen", `Standalone dispatcher: ${eventName}`, JSON.stringify(payload));
    });

    d.dispatch("standalone.hello", { from: "standalone" });
    d.dispatch("standalone.world", { from: "standalone" });

    log("info", `Standalone MemoryDispatcher works without DI`);
    d.destroy();
  }

  // ── Clear ─────────────────────────────────────────────────────────────

  function clearLogs() {
    setLogs([]);
    events.forgetAll();
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      <div>
        <h1 className={title()}>Events Package</h1>
        <p className={subtitle({ class: "mt-2" })}>
          @abdokouta/ts-events — Laravel-style event dispatcher with wildcards, priority, RxJS, and
          multiple drivers
        </p>
      </div>

      {/* API Reference */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">API Reference</h2>
          <p className="text-sm text-default-500">
            EventService methods — all delegate to the default dispatcher.
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
            {[
              "dispatch(event, payload?)",
              "listen(event, cb, priority?)",
              "once(event, cb, priority?)",
              "until(event, payload?)",
              "subscribe(subscriber)",
              "hasListeners(event)",
              "getListeners(event)",
              "forget(event)",
              "forgetAll()",
              "asObservable()",
              "dispatcher(name?)",
              "destroyAll()",
            ].map((m) => (
              <div key={m} className="rounded-lg border border-divider px-2 py-1.5">
                {m}
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Demo Buttons */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Test All Functions</h2>
          <p className="text-sm text-default-500">
            Click each button to test a specific event function. Results appear in the log feed
            below.
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onPress={demoDispatch}>
              dispatch()
            </Button>
            <Button variant="secondary" size="sm" onPress={demoListen}>
              listen() + unsub
            </Button>
            <Button variant="secondary" size="sm" onPress={demoOnce}>
              once()
            </Button>
            <Button variant="secondary" size="sm" onPress={demoUntil}>
              until()
            </Button>
            <Button variant="tertiary" size="sm" onPress={demoWildcards}>
              Wildcard *
            </Button>
            <Button variant="tertiary" size="sm" onPress={demoDoubleWildcard}>
              Wildcard **
            </Button>
            <Button variant="tertiary" size="sm" onPress={demoPriority}>
              Priority
            </Button>
            <Button variant="tertiary" size="sm" onPress={demoStopPropagation}>
              Stop Propagation
            </Button>
            <Button variant="secondary" size="sm" onPress={demoForgetAndQuery}>
              forget / has / get
            </Button>
            <Button variant="secondary" size="sm" onPress={demoObjectEvents}>
              Object Events
            </Button>
            <Button variant="warning" size="sm" onPress={demoRxJS}>
              RxJS Observable
            </Button>
            <Button variant="secondary" size="sm" onPress={demoNullDispatcher}>
              NullDispatcher
            </Button>
            <Button variant="secondary" size="sm" onPress={demoStandaloneDispatcher}>
              Standalone Dispatcher
            </Button>
            <Button variant="outline" size="sm" onPress={clearLogs}>
              Clear
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Log Feed */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Event Log</h2>
            <p className="text-sm text-default-500">{logs.length} entries</p>
          </div>
          <Chip size="sm" variant="primary" color={logs.length > 0 ? "success" : "default"}>
            {logs.length > 0 ? "active" : "idle"}
          </Chip>
        </Card.Header>
        <Separator />
        <Card.Content>
          {logs.length === 0 ? (
            <p className="text-center text-sm text-default-400 py-8">
              No events yet — click a button above to test.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
              {logs.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg bg-default-50 border border-divider p-3 font-mono text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Chip size="sm" color={TYPE_COLORS[entry.type] ?? "default"} variant="soft">
                      {entry.type}
                    </Chip>
                    <span className="text-default-400">{entry.timestamp}</span>
                  </div>
                  <p className="text-foreground">{entry.message}</p>
                  {entry.detail && <p className="mt-1 text-default-500">{entry.detail}</p>}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </section>
  );
}
