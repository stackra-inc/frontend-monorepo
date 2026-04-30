/**
 * DI Container Demo Page
 *
 * Demonstrates @stackra/ts-container features:
 * - `@Injectable()` decorator for marking services
 * - `@Module()` decorator for grouping providers
 * - `Application.create()` for bootstrapping
 * - `Scope.DEFAULT` (singleton) vs `Scope.TRANSIENT` (new instance each time)
 *
 * Decorated classes are defined at module scope because decorators
 * are compile-time constructs and cannot be used inside React components.
 *
 * @module pages/demos/ts-container
 */

import { useState, useCallback } from "react";
import { Injectable, Module, Application, Scope } from "@stackra/ts-container";
import { Card, Button } from "@heroui/react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

// ── Example Services (module scope — decorators require this) ───────────

/**
 * A simple greeting service registered as a singleton (default scope).
 */
@Injectable()
class GreetingService {
  private readonly _id = Math.random().toString(36).substring(2, 8);

  /**
   * Return a greeting message including the instance ID.
   *
   * @param name - The name to greet
   * @returns A greeting string with the instance identifier
   */
  public greet(name: string): string {
    return `Hello, ${name}! (instance: ${this._id})`;
  }

  /**
   * Return the unique instance identifier.
   *
   * @returns The random ID assigned at construction time
   */
  public getId(): string {
    return this._id;
  }
}

/**
 * A counter service registered as transient — each resolution creates a new instance.
 */
@Injectable({ scope: Scope.TRANSIENT })
class TransientCounter {
  private readonly _id = Math.random().toString(36).substring(2, 8);
  private _count = 0;

  /**
   * Increment and return the current count.
   *
   * @returns The incremented count value
   */
  public increment(): number {
    this._count += 1;

    return this._count;
  }

  /**
   * Return the unique instance identifier.
   *
   * @returns The random ID assigned at construction time
   */
  public getId(): string {
    return this._id;
  }
}

/**
 * Demo module that registers both services.
 */
@Module({
  providers: [GreetingService, TransientCounter],
  exports: [GreetingService, TransientCounter],
})
class DemoModule {}

// ── Log entry type ──────────────────────────────────────────────────────

/**
 * Represents a single log entry in the demo output.
 */
interface LogEntry {
  /** Timestamp label */
  time: string;
  /** Log message content */
  message: string;
}

// ── React Component ─────────────────────────────────────────────────────

/**
 * TsContainerDemo — interactive demo of the DI container.
 *
 * Bootstraps a mini application, resolves services, and shows
 * the difference between singleton and transient scopes.
 *
 * @returns The container demo page
 */
export default function TsContainerDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [app, setApp] = useState<Application | null>(null);

  /**
   * Append a message to the log output.
   *
   * @param message - The message to log
   */
  const log = useCallback((message: string) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  /**
   * Bootstrap the DI container with the DemoModule.
   */
  const handleBootstrap = useCallback(async () => {
    try {
      log("Bootstrapping Application.create(DemoModule)...");
      const application = await Application.create(DemoModule);

      setApp(application);
      setIsBootstrapped(true);
      log("Container bootstrapped successfully.");
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [log]);

  /**
   * Resolve the singleton GreetingService twice and compare instance IDs.
   */
  const handleResolveSingleton = useCallback(() => {
    if (!app) return;
    try {
      const svc1 = app.get(GreetingService);
      const svc2 = app.get(GreetingService);

      log(`Resolved GreetingService #1 → id: ${svc1.getId()}`);
      log(`Resolved GreetingService #2 → id: ${svc2.getId()}`);
      log(`Same instance? ${svc1 === svc2 ? "YES (singleton)" : "NO"}`);
      log(svc1.greet("World"));
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [app, log]);

  /**
   * Resolve the transient TransientCounter twice and compare instance IDs.
   */
  const handleResolveTransient = useCallback(() => {
    if (!app) return;
    try {
      const c1 = app.get(TransientCounter);
      const c2 = app.get(TransientCounter);

      log(`Resolved TransientCounter #1 → id: ${c1.getId()}`);
      log(`Resolved TransientCounter #2 → id: ${c2.getId()}`);
      log(`Same instance? ${c1 === c2 ? "YES" : "NO (transient)"}`);
      log(`Counter #1 increment: ${String(c1.increment())}`);
      log(`Counter #2 increment: ${String(c2.increment())}`);
    } catch (err) {
      log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [app, log]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-4xl mx-auto">
        <div>
          <Link className="text-sm text-accent hover:underline" to="/demos">
            ← Back to Demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">@stackra/ts-container</h1>
          <p className="mt-1 text-muted">
            Dependency injection container with decorators, modules, and scopes.
          </p>
        </div>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <Card>
          <Card.Header>
            <Card.Title>Actions</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-wrap gap-3">
              <Button isDisabled={isBootstrapped} onPress={handleBootstrap}>
                {isBootstrapped ? "Bootstrapped ✓" : "Bootstrap Container"}
              </Button>
              <Button isDisabled={!isBootstrapped} onPress={handleResolveSingleton}>
                Resolve Singleton
              </Button>
              <Button isDisabled={!isBootstrapped} onPress={handleResolveTransient}>
                Resolve Transient
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
              {`@Injectable()
class GreetingService {
  greet(name: string) { return \`Hello, \${name}!\`; }
}

@Injectable({ scope: Scope.TRANSIENT })
class TransientCounter {
  private count = 0;
  increment() { return ++this.count; }
}

@Module({
  providers: [GreetingService, TransientCounter],
  exports:   [GreetingService, TransientCounter],
})
class DemoModule {}

const app = await Application.create(DemoModule);
const svc = app.get(GreetingService); // singleton
const ctr = app.get(TransientCounter); // new each time`}
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
                  Click &quot;Bootstrap Container&quot; to start...
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
