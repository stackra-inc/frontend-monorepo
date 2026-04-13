/**
 * @file pages/container.tsx
 * @description DI Container package showcase page.
 *
 * Demonstrates @abdokouta/ts-container:
 *   - @Injectable() decorator
 *   - @Module() with providers and imports
 *   - useInject() hook to resolve services
 *   - useModule() hook to inspect the module tree
 *   - Service-to-service dependencies via @Inject()
 */

import { useState } from "react";
import { Injectable, Module, Inject } from "@abdokouta/ts-container";
import { useInject, useModule, ContainerProvider } from "@abdokouta/ts-container-react";
import { Card, Chip, Separator, Button } from "@heroui/react";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

// ---------------------------------------------------------------------------
// Demo services
// ---------------------------------------------------------------------------

@Injectable()
class CounterService {
  private count = 0;
  increment(): number {
    return ++this.count;
  }
  getCount(): number {
    return this.count;
  }
  reset(): void {
    this.count = 0;
  }
}

@Injectable()
class GreeterService {
  constructor(@Inject(CounterService) private readonly counter: CounterService) {}

  greet(name: string): string {
    const count = this.counter.getCount();
    return `Hello, ${name}! You have clicked ${count} time${count !== 1 ? "s" : ""}.`;
  }
}

@Module({
  providers: [CounterService, GreeterService],
  exports: [CounterService, GreeterService],
})
class DemoModule {}

// ---------------------------------------------------------------------------
// Demo sub-components
// ---------------------------------------------------------------------------

function CounterWidget() {
  const counter = useInject(CounterService);
  const [display, setDisplay] = useState(counter.getCount());

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-divider p-6">
      <p className="text-sm text-default-500">CounterService (Singleton)</p>
      <span className="text-5xl font-bold tabular-nums">{display}</span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="primary"
          onPress={() => {
            counter.increment();
            setDisplay(counter.getCount());
          }}
        >
          +1
        </Button>
        <Button
          size="sm"
          variant="outline"
          onPress={() => {
            counter.reset();
            setDisplay(0);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

function GreeterWidget() {
  const greeter = useInject(GreeterService);
  const [name, setName] = useState("World");
  const [greeting, setGreeting] = useState(greeter.greet("World"));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-divider p-6">
      <p className="text-sm text-default-500">GreeterService (depends on CounterService)</p>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-divider bg-default-100 px-3 py-2 text-sm outline-none focus:border-primary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setGreeting(greeter.greet(name))}
          placeholder="Your name"
        />
        <Button size="sm" variant="secondary" onPress={() => setGreeting(greeter.greet(name))}>
          Greet
        </Button>
      </div>
      <p className="rounded-lg bg-default-100 px-3 py-2 text-sm font-mono">{greeting}</p>
    </div>
  );
}

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

export default function ContainerPage() {
  return (
    <DefaultLayout>
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
              CounterWidget and GreeterWidget share the same CounterService singleton.
            </p>
          </Card.Header>
          <Separator />
          <Card.Content>
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
    </DefaultLayout>
  );
}
