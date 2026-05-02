/**
 * @fileoverview Analytics & Tracking Demo Route
 *
 * Demonstrates the integration between @stackra/react-router and @stackra/react-tracking.
 * Shows automatic page view tracking, consent management, and manual event tracking.
 */

import { useState, useEffect } from "react";
import { Route, AppLink } from "@stackra/react-router";
import { Card, Button, Badge, Switch, Separator, Label } from "@heroui/react";
import { Activity, Eye, MousePointer, Clock, CheckCircle } from "lucide-react";

/**
 * Analytics Demo Route
 *
 * Showcases tracking integration and consent management.
 */
@Route({
  path: "/demos/features/analytics",
  label: "Analytics & Tracking",
  variant: "main",
  parent: "/demos",
  order: 21,
  meta: {
    title: "Analytics & Tracking Demo",
    description: "Demonstrates router and tracking integration with automatic page view tracking",
  },
})
export class AnalyticsDemoRoute {
  render() {
    return <AnalyticsDemoPage />;
  }
}

/**
 * Analytics Demo Page Component
 */
function AnalyticsDemoPage() {
  const [pageViews, setPageViews] = useState(0);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [events, setEvents] = useState<Array<{ type: string; timestamp: number; data: any }>>([]);

  /**
   * Simulate tracking an event
   */
  const trackEvent = (type: string, data: any = {}) => {
    const event = {
      type,
      timestamp: Date.now(),
      data,
    };
    setEvents((prev) => [event, ...prev].slice(0, 10)); // Keep last 10 events
    console.log("[Analytics Demo] Event tracked:", event);
  };

  /**
   * Track page view on mount
   */
  useEffect(() => {
    setPageViews((prev) => prev + 1);
    trackEvent("page_view", { path: "/demos/features/analytics" });
    return undefined;
  }, []);

  /**
   * Handle CTA click tracking
   */
  const handleCtaClick = (ctaId: string) => {
    trackEvent("cta_click", { cta_id: ctaId, path: "/demos/features/analytics" });
  };

  /**
   * Handle scroll depth tracking
   */
  const handleScrollDepth = (depth: number) => {
    trackEvent("scroll_depth", { depth, path: "/demos/features/analytics" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics & Tracking Demo</h1>
        <p className="text-default-500">
          Integration between @stackra/react-router and @stackra/react-tracking
        </p>
      </div>

      {/* Tracking Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Tracking Status</h2>
            <p className="text-sm text-default-500">
              Page views: <Badge color="accent">{pageViews}</Badge>
            </p>
          </div>
          <Switch isSelected={trackingEnabled} onChange={setTrackingEnabled}>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Content>
              <Label className="text-sm">
                {trackingEnabled ? "Tracking Enabled" : "Tracking Disabled"}
              </Label>
            </Switch.Content>
          </Switch>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Page Views</h3>
            </div>
            <p className="text-sm text-default-500">
              Automatically tracked on every navigation via RouterTrackingMiddleware
            </p>
          </div>

          <div className="p-4 bg-secondary-50 dark:bg-secondary-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold">CTA Clicks</h3>
            </div>
            <p className="text-sm text-default-500">
              Track button clicks with data-track-cta attribute
            </p>
          </div>

          <div className="p-4 bg-warning-50 dark:bg-warning-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Engagement</h3>
            </div>
            <p className="text-sm text-default-500">Scroll depth and time on page tracking</p>
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">1. Automatic Page View Tracking</h3>
            <p className="text-default-500">
              The <code>RouterTrackingMiddleware</code> from @stackra/react-tracking automatically
              tracks page views on every navigation. It implements the <code>AfterNavigate</code>
              interface from the router.
            </p>
            <pre className="mt-2 p-3 bg-default-100 rounded-lg overflow-x-auto">
              {`RouterModule.forRoot({
  middleware: [RouterTrackingMiddleware],
})`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-1">2. Pixel Management</h3>
            <p className="text-default-500">
              The TrackingService dispatches events to all configured pixel platforms (Meta, Google
              Analytics, TikTok) via the PixelManager.
            </p>
            <pre className="mt-2 p-3 bg-default-100 rounded-lg overflow-x-auto">
              {`TrackingModule.forRoot({
  meta: { pixelId: '123456789' },
  google: { measurementId: 'G-XXXXXXXXXX' },
  tiktok: { pixelCode: 'CXXXXXXXXX' },
})`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-1">3. Consent Management</h3>
            <p className="text-default-500">
              The ConsentService manages per-category consent (analytics, marketing, functional).
              All tracking respects consent settings and queues events when offline.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">4. Manual Event Tracking</h3>
            <p className="text-default-500">
              Use the TrackingFacade or TrackingService to manually track custom events:
            </p>
            <pre className="mt-2 p-3 bg-default-100 rounded-lg overflow-x-auto">
              {`TrackingFacade.trackCtaClick('signup-button', '/home');
TrackingFacade.trackScrollDepth(50, '/products');
TrackingFacade.trackTimeOnPage(120, '/about');`}
            </pre>
          </div>
        </div>
      </Card>

      {/* Interactive Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Interactive Demo</h2>
        <p className="text-sm text-default-500 mb-4">
          Click these buttons to simulate tracking events. Check the console and event log below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button onPress={() => handleCtaClick("demo-button-1")} data-track-cta="demo-button-1">
            <MousePointer className="w-4 h-4" />
            Track CTA Click
          </Button>

          <Button variant="secondary" onPress={() => handleScrollDepth(50)}>
            <Activity className="w-4 h-4" />
            Simulate Scroll (50%)
          </Button>

          <Button
            variant="tertiary"
            onPress={() => trackEvent("custom_event", { action: "button_click" })}
          >
            <Activity className="w-4 h-4" />
            Track Custom Event
          </Button>

          <AppLink
            to="/demos/router/prefetch"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Navigate (Track Page View)
          </AppLink>
        </div>

        {/* Event Log */}
        <div>
          <h3 className="font-semibold mb-2">Event Log (Last 10 Events)</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-default-400 italic">No events tracked yet</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="p-3 bg-default-100 rounded-lg text-xs font-mono">
                  <div className="flex items-center justify-between mb-1">
                    <Badge color="accent" size="sm">
                      {event.type}
                    </Badge>
                    <span className="text-default-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-default-600 overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Configuration */}
      <Card className="p-6 bg-primary-50 dark:bg-primary-950">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Environment Variables</h3>
            <pre className="p-3 bg-white dark:bg-default-100 rounded-lg overflow-x-auto">
              {`VITE_META_PIXEL_ID=123456789
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_TIKTOK_PIXEL_CODE=CXXXXXXXXX
VITE_TRACKING_SCROLL_DEPTH=true
VITE_TRACKING_TIME_ON_PAGE=true
VITE_TRACKING_CTA=true`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-1">App Module Setup</h3>
            <pre className="p-3 bg-white dark:bg-default-100 rounded-lg overflow-x-auto">
              {`import { TrackingModule, RouterTrackingMiddleware } from '@stackra/react-tracking';
import { RouterModule } from '@stackra/react-router';
import trackingConfig from '@/config/tracking.config';

@Module({
  imports: [
    TrackingModule.forRoot(trackingConfig),
    RouterModule.forRoot({
      middleware: [RouterTrackingMiddleware],
    }),
  ],
})
export class AppModule {}`}
            </pre>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Benefits</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span>
              <strong>Automatic Tracking:</strong> Page views tracked on every navigation without
              manual instrumentation
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span>
              <strong>Multi-Platform:</strong> Single integration dispatches to Meta, Google,
              TikTok, and custom platforms
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span>
              <strong>Consent Management:</strong> GDPR-compliant consent handling with per-category
              control
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span>
              <strong>Offline Queue:</strong> Events queued when offline and dispatched when
              connection restored
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span>
              <strong>Error Resilience:</strong> Tracking failures never break navigation or user
              experience
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
