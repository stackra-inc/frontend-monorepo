/**
 * @fileoverview PullToRefresh — wrapper component with pull-to-refresh gesture.
 *
 * Uses HeroUI Spinner for the loading indicator and Lucide ArrowDown
 * for the pull hint. Wraps children and renders a pull indicator above
 * the content.
 *
 * @module pwa/components/pull-to-refresh
 */

import React from 'react';
import { Spinner } from '@heroui/react';
import { ArrowDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import type { PullToRefreshConfig } from '@/interfaces';
import { PULL_TO_REFRESH_DEFAULTS } from '@/constants';

/** Props for the PullToRefresh component. */
export interface PullToRefreshProps extends PullToRefreshConfig {
  /** Content to wrap with pull-to-refresh gesture. */
  children: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Wrapper component that adds pull-to-refresh gesture to its children.
 *
 * @example
 * ```tsx
 * <PullToRefresh onRefresh={async () => { await fetchData(); }}>
 *   <MyScrollableContent />
 * </PullToRefresh>
 * ```
 */
export function PullToRefresh({
  children,
  className,
  indicator,
  ...config
}: PullToRefreshProps): React.JSX.Element {
  const { pullDistance, isRefreshing, isPastThreshold, handlers } = usePullToRefresh(config);
  const threshold = config.threshold ?? PULL_TO_REFRESH_DEFAULTS.THRESHOLD;

  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{ touchAction: 'pan-x pan-down' }}
      {...handlers}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{
          height: showIndicator ? Math.max(pullDistance, isRefreshing ? 40 : 0) : 0,
        }}
      >
        {indicator ??
          (isRefreshing ? (
            <Spinner size="sm" color="accent" />
          ) : (
            <ArrowDown
              size={20}
              className={`transition-transform duration-200 ${
                isPastThreshold ? 'text-accent' : 'text-muted'
              }`}
              style={{
                transform: `rotate(${isPastThreshold ? 180 : (pullDistance / threshold) * 180}deg)`,
              }}
            />
          ))}
      </div>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}
