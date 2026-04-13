"use client";

/**
 * @file app/container/page.tsx
 * @description DI Container package showcase page.
 *
 * Demonstrates @abdokouta/ts-container:
 *   - @Injectable() decorator
 *   - @Module() with providers and imports
 *   - useInject() hook to resolve services
 *   - useModule() hook to inspect the module tree
 *   - Factory providers
 *   - Singleton vs Transient scope
 */

import React, { useState } from "react";
import { Injectable, Module, Inject } from "@abdokouta/ts-container";
import { useInject, useModule, ContainerProvider } from "@abdokouta/ts-container-react";
import { Card, Chip, Separator, Button } from "@heroui/react";

import { title, subtitle } from "@/components/primitives";

// ---------------------------------------------------------------------------
// Demo services
// ---------------------------------------------------------------------------

/**
 * CounterService — a simple singleton service that tracks a click count.
 * Demonstrates that the same instance is shared across components.
 */
@Injectable()
class CounterService {
  private count = 0;

  /** Increment the counter and return the new value. */
  increment(): number {
    return ++this.count;
  }

  /** Return the current count without incrementing. */
  getCount(): number {
    return this.count;
  }

  /** Reset the counter to zero. */
  reset(): void {
    this.count = 0;
  }
}

/**
 * GreeterService — depends on CounterService via constructor injection.
 * Demonstrates @Inject() decorator and service-to-service dependencies.
 */
@Injectable()
class GreeterService {
  constructor(@Inject(CounterService) private readonly counter: CounterService) {}

  /**
   * Return a greeting that includes the current click count.
   * @param name - The name to greet.
   */
  greet(name: string): string {
    const count = this.counter.getCount();
    return `Hello, ${name}! You have clicked ${count} time${count !== 1 ? "s" : ""}.`;
  }
}

/**
 * DemoModule — a self-contained module that provides CounterService
 * and GreeterService. Imported by the demo sub-tree.
 */
@Module({
  providers: [CounterService, GreeterService],
  exports: [CounterService, GreeterService],
})
class DemoModule {}

// ---------------------------------------------------------------------------
// Demo sub-components (use the DemoModule container)
// ---------------------------------------------------------------------------

/**
 * CounterWidget — resolves CounterService and renders an interactive counter.
 */
function CounterWidget() {
  const counter = useInject(CounterService);
  const [display, setDisplay] = useState(counter.getCount());

  function handleIncrement() {
    counter.increment();
    setDisplay(counter.getCount());
  }

  function handleReset() {
    counter.reset();
    setDisplay(0);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-divider p-6">
      <p className="text-sm text-default-500">CounterService (Singleton)</p>
      <span className="text-5xl font-bold tabular-nums">{display}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="primary" onPress={handleIncrement}>
          +1
        </Button>
        <Button size="sm" variant="outline" onPress={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

/**
 * GreeterWidget — resolves GreeterService and renders a greeting.
 * Shares the same CounterService instance as CounterWidget.
 */
function GreeterWidget() {
  const greeter = useInject(GreeterService);
  const [name, setName] = useState("World");
  const [greeting, setGreeting] = useState(greeter.greet("World"));

  function handleGreet() {
    setGreeting(greeter.greet(name));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-divider p-6">
      <p className="text-sm text-default-500">GreeterService (depends on CounterService)</p>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-divider bg-default-100 px-3 py-2 text-sm outline-none focus:border-primary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGreet()}
          placeholder="Your name"
        />
        <Button size="sm" variant="secondary" onPress={handleGreet}>
          Greet
        </Button>
      </div>
      <p className="rounded-lg bg-default-100 px-3 py-2 text-sm font-mono">{greeting}</p>
    </div>
  );
}

/**
 * ModuleInspector — uses useModule() to display the resolved module metadata.
 */
function ModuleInspector() {
  const mod = useModule(DemoModule);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-divider p-4">
      <p className="text-sm font-medium">Module: DemoModule</p>
      <div className="flex flex-wrap gap-2">
        {["CounterService", "GreeterService"].map((name) => (
          <Chip key={name} size="sm" color="accent" variant="soft">
            {name}
          </Chip>
        ))}
      </div>
      <p className="text-xs text-default-400">
        Container resolved: {mod ? "✅ yes" : "⏳ pending"}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * ContainerPage — wraps the demo widgets in their own ContainerProvider
 * so they use DemoModule independently of the root AppModule.
 */
export default function ContainerPage() {
  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      {/* Header */}
      <div>
        <h1 className={title()}>Container Package</h1>
        <p className={subtitle({ class: "mt-2" })}>
          @abdokouta/ts-container — NestJS-style dependency injection for React
        </p>
      </div>

      {/* Concept cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: "💉",
            label: "@Injectable()",
            desc: "Mark a class as a DI-managed service. The container handles instantiation and lifecycle.",
          },
          {
            icon: "📦",
            label: "@Module()",
            desc: "Group providers and imports. Modules are the unit of encapsulation in the DI system.",
          },
          {
            icon: "🪝",
            label: "useInject()",
            desc: "React hook to resolve a service from the nearest ContainerProvider in the tree.",
          },
        ].map((item) => (
          <Card key={item.label} className="border border-divider">
            <Card.Content className="flex flex-col gap-2">
              <span className="text-3xl">{item.icon}</span>
              <p className="font-mono text-sm font-semibold text-primary">{item.label}</p>
              <p className="text-xs text-default-500">{item.desc}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Live demo */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Live Demo — DemoModule</h2>
          <p className="text-sm text-default-500">
            CounterWidget and GreeterWidget share the same CounterService singleton — incrementing
            in one updates the greeting in the other.
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          {/* Isolated container for the demo */}
          <ContainerProvider module={DemoModule}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CounterWidget />
                <GreeterWidget />
              </div>
              <ModuleInspector />
            </div>
          </ContainerProvider>
        </Card.Content>
      </Card>

      {/* Code snippet */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">How It Works</h2>
        </Card.Header>
        <Separator />
        <Card.Content>
          <pre className="overflow-x-auto rounded-lg bg-default-100 p-4 text-xs font-mono text-foreground">
            {`@Injectable()
class CounterService {
  private count = 0;
  increment() { return ++this.count; }
}

@Injectable()
class GreeterService {
  constructor(
    @Inject(CounterService) private counter: CounterService
  ) {}
  greet(name: string) {
    return \`Hello \${name}! Clicks: \${this.counter.getCount()}\`;
  }
}

@Module({ providers: [CounterService, GreeterService] })
class DemoModule {}

// In React:
function MyComponent() {
  const counter = useInject(CounterService);
  return <button onClick={() => counter.increment()}>+1</button>;
}`}
          </pre>
        </Card.Content>
      </Card>
    </section>
  );
}
