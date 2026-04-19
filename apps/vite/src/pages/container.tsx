/**
 * @file pages/container.tsx
 * @description DI Container demo page.
 *
 * Demonstrates @stackra-inc/ts-container:
 *   - @Injectable() decorator
 *   - @Inject() for constructor injection
 *   - @Module() with providers
 *   - useInject() hook to resolve services
 *   - Service-to-service dependencies
 */

import { useState, useEffect } from 'react';
import { Injectable, Module, Inject } from '@stackra-inc/ts-container';
import { useInject, ContainerProvider } from '@stackra-inc/ts-container';
import { ApplicationContext } from '@stackra-inc/ts-container';

import { title, subtitle } from '@/components/primitives';

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

    return `Hello, ${name}! You have clicked ${count} time${count !== 1 ? 's' : ''}.`;
  }
}

@Module({
  providers: [CounterService, GreeterService],
  exports: [CounterService, GreeterService],
})
class DemoModule {}

// ---------------------------------------------------------------------------
// Demo widgets (rendered inside ContainerProvider)
// ---------------------------------------------------------------------------

function CounterWidget() {
  const counter = useInject(CounterService);
  const [display, setDisplay] = useState(counter.getCount());

  return (
    <div className="border-divider flex flex-col items-center gap-3 rounded-xl border p-6">
      <p className="text-default-500 text-sm">CounterService (Singleton)</p>
      <span className="text-5xl font-bold tabular-nums">{display}</span>
      <div className="flex gap-2">
        <button
          className="bg-primary rounded-lg px-4 py-2 text-sm text-white"
          onClick={() => {
            counter.increment();
            setDisplay(counter.getCount());
          }}
        >
          +1
        </button>
        <button
          className="border-divider rounded-lg border px-4 py-2 text-sm"
          onClick={() => {
            counter.reset();
            setDisplay(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function GreeterWidget() {
  const greeter = useInject(GreeterService);
  const [name, setName] = useState('World');
  const [greeting, setGreeting] = useState(greeter.greet('World'));

  return (
    <div className="border-divider flex flex-col gap-3 rounded-xl border p-6">
      <p className="text-default-500 text-sm">GreeterService (depends on CounterService)</p>
      <div className="flex gap-2">
        <input
          className="border-divider bg-default-100 focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setGreeting(greeter.greet(name))}
        />
        <button
          className="bg-default-200 rounded-lg px-4 py-2 text-sm"
          onClick={() => setGreeting(greeter.greet(name))}
        >
          Greet
        </button>
      </div>
      <p className="bg-default-100 rounded-lg px-3 py-2 font-mono text-sm">{greeting}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContainerPage() {
  const [demoApp, setDemoApp] = useState<ApplicationContext | null>(null);

  useEffect(() => {
    ApplicationContext.create(DemoModule).then(setDemoApp);
  }, []);

  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      <div>
        <h1 className={title()}>Container Package</h1>
        <p className={subtitle({ class: 'mt-2' })}>
          @stackra-inc/ts-container — NestJS-style dependency injection
        </p>
      </div>

      {/* Concept cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: '💉',
            label: '@Injectable()',
            desc: 'Mark a class as a DI-managed service.',
          },
          {
            icon: '📦',
            label: '@Module()',
            desc: 'Group providers and imports into modules.',
          },
          {
            icon: '🪝',
            label: 'useInject()',
            desc: 'React hook to resolve a service from DI.',
          },
        ].map((item) => (
          <div key={item.label} className="border-divider rounded-xl border p-4">
            <span className="text-3xl">{item.icon}</span>
            <p className="text-primary mt-2 font-mono text-sm font-semibold">{item.label}</p>
            <p className="text-default-500 mt-1 text-xs">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Live demo */}
      <div className="border-divider rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Live Demo — DemoModule</h2>
        <p className="text-default-500 mb-4 text-sm">
          CounterWidget and GreeterWidget share the same CounterService singleton.
        </p>

        {demoApp ? (
          <ContainerProvider context={demoApp}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CounterWidget />
              <GreeterWidget />
            </div>
          </ContainerProvider>
        ) : (
          <p className="text-default-400 text-sm">Bootstrapping DemoModule...</p>
        )}
      </div>

      {/* Code snippet */}
      <div className="border-divider rounded-xl border p-6">
        <h2 className="mb-4 text-lg font-semibold">How It Works</h2>
        <pre className="bg-default-100 overflow-x-auto rounded-lg p-4 font-mono text-xs">
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
      </div>
    </section>
  );
}
