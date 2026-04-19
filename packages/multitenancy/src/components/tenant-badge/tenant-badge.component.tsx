/**
 * TenantBadge Component
 *
 * A badge component for displaying the current tenant.
 * Built with HeroUI v3 Badge component.
 *
 * @example
 * ```tsx
 * import { TenantBadge } from "@stackra-inc/react-multitenancy";
 *
 * <TenantBadge />
 * ```
 */

import React from 'react';
import { Chip } from '@heroui/react';
import { useTenant } from '@/hooks';
import type { Tenant } from '@/types';

/**
 * Props for TenantBadge component
 */
export interface TenantBadgeProps {
  /**
   * Color variant of the badge
   * @default "accent"
   */
  color?: 'default' | 'accent' | 'success' | 'warning' | 'danger';

  /**
   * Custom class name for the badge
   */
  className?: string;

  /**
   * Whether to show loading state
   * @default true
   */
  showLoading?: boolean;

  /**
   * Custom loading text
   * @default "Loading..."
   */
  loadingText?: string;

  /**
   * Custom text when no tenant is selected
   * @default "No tenant"
   */
  noTenantText?: string;

  /**
   * Custom render function for tenant display
   *
   * @param tenant - The current tenant
   * @returns React node to display
   */
  renderTenant?: (tenant: Tenant) => React.ReactNode;

  /**
   * Whether to show tenant ID
   * @default false
   */
  showId?: boolean;

  /**
   * Prefix text before tenant name
   */
  prefix?: string;
}

/**
 * TenantBadge Component
 *
 * @description
 * A badge component for displaying the current tenant.
 * Automatically handles loading states and missing tenant.
 *
 * @param props - Component props
 * @returns Rendered badge component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TenantBadge />
 * ```
 *
 * @example
 * ```tsx
 * // With custom variant
 * <TenantBadge variant="secondary" size="lg" />
 * ```
 *
 * @example
 * ```tsx
 * // With prefix
 * <TenantBadge prefix="Current:" />
 * ```
 *
 * @example
 * ```tsx
 * // Custom render
 * <TenantBadge
 *   renderTenant={(tenant) => (
 *     <span>{tenant.name} ({tenant.slug})</span>
 *   )}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Show tenant ID
 * <TenantBadge showId />
 * ```
 */
export const TenantBadge: React.FC<TenantBadgeProps> = ({
  color = 'accent',
  className,
  showLoading = true,
  loadingText = 'Loading...',
  noTenantText = 'No tenant',
  renderTenant,
  showId = false,
  prefix,
}) => {
  const { tenant, isLoading } = useTenant();

  /**
   * Render tenant content
   */
  const renderContent = () => {
    // Show loading state
    if (isLoading && showLoading) {
      return loadingText;
    }

    // Show no tenant state
    if (!tenant) {
      return noTenantText;
    }

    // Custom render
    if (renderTenant) {
      return renderTenant(tenant);
    }

    // Default render
    const tenantName = tenant.name;
    const tenantId = showId ? ` (${tenant.id})` : '';
    const prefixText = prefix ? `${prefix} ` : '';

    return `${prefixText}${tenantName}${tenantId}`;
  };

  return (
    <Chip color={color} className={className}>
      {renderContent()}
    </Chip>
  );
};

export default TenantBadge;
