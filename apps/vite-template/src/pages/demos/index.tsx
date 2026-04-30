/**
 * Demos Landing Page
 *
 * Card grid showing all available @stackra package demos.
 * Each card links to an individual demo page for the package.
 *
 * @module pages/demos
 */

import { Link } from "react-router-dom";
import { Card } from "@heroui/react";

import DefaultLayout from "@/layouts/default";

/**
 * Demo card metadata for each @stackra package.
 */
const demos = [
  {
    name: "@stackra/ts-container",
    path: "/demos/ts-container",
    description:
      "Dependency injection container with decorators, modules, scopes, and lifecycle hooks.",
  },
  {
    name: "@stackra/ts-support",
    path: "/demos/ts-support",
    description:
      "String utilities (Str), Collection helpers, and Facade pattern for static-style DI access.",
  },
  {
    name: "@stackra/ts-cache",
    path: "/demos/ts-cache",
    description:
      "Cache-aside pattern with memory and Redis stores. Put, get, remember, forget, and flush.",
  },
  {
    name: "@stackra/ts-config",
    path: "/demos/ts-config",
    description:
      "Environment-aware configuration with typed access, prefix stripping, and nested keys.",
  },
  {
    name: "@stackra/ts-events",
    path: "/demos/ts-events",
    description: "Pub/sub event dispatching with wildcard listeners, memory and Redis drivers.",
  },
  {
    name: "@stackra/ts-http",
    path: "/demos/ts-http",
    description: "HTTP client with GET/POST support, interceptors, and response handling.",
  },
  {
    name: "@stackra/ts-redis",
    path: "/demos/ts-redis",
    description:
      "Upstash Redis HTTP client for browser-compatible SET, GET, DEL, and key management.",
  },
  {
    name: "@stackra/ts-logger",
    path: "/demos/ts-logger",
    description: "Multi-channel logging with console, storage, and combined transporters.",
  },
  {
    name: "@stackra/react-i18n",
    path: "/demos/react-i18n",
    description:
      "Internationalization with locale detection, language switching, and translation hooks.",
  },
  {
    name: "@stackra/ts-realtime",
    path: "/demos/ts-realtime",
    description: "WebSocket real-time events via Soketi/Pusher with channel subscriptions.",
  },
];

/**
 * DemosPage — card grid landing page for all package demos.
 *
 * @returns The demos index page with a card for each package
 */
export default function DemosPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center gap-8 py-8 md:py-10">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-foreground">Package Demos</h1>
          <p className="mt-3 text-lg text-muted">
            Interactive demos for every @stackra package. Click a card to explore.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {demos.map((demo) => (
            <Link key={demo.path} className="no-underline" to={demo.path}>
              <Card className="h-full hover:border-accent transition-colors">
                <Card.Header>
                  <Card.Title>{demo.name}</Card.Title>
                  <Card.Description>{demo.description}</Card.Description>
                </Card.Header>
                <Card.Footer>
                  <span className="text-sm font-medium text-accent">View demo →</span>
                </Card.Footer>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
