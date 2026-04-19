/**
 * TenantCard Component
 *
 * A card component for displaying tenant information.
 * Built with HeroUI v3 Card component.
 *
 * @example
 * ```tsx
 * import { TenantCard } from "@stackra-inc/react-multitenancy";
 *
 * <TenantCard />
 * ```
 */

import React from 'react';
import { Card } from '@heroui/react';
import { useTenant } from '@/hooks';
import type { Tenant } from '@/types';

/**
 * Props for TenantCard component
 */
export interface TenantCardProps {
  /**
   * Custom class name for the card
   */
  className?: string;

  /**
   * Whether to show loading state
   * @default true
   */
  showLoading?: boolean;

  /**
   * Custom loading content
   */
  loadingContent?: React.ReactNode;

  /**
   * Custom content when no tenant is selected
   */
  noTenantContent?: React.ReactNode;

  /**
   * Custom render function for tenant content
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
   * Whether to show tenant metadata
   * @default true
   */
  showMetadata?: boolean;

  /**
   * Additional actions to display in the card
   */
  actions?: React.ReactNode;
}

/**
 * TenantCard Component
 *
 * @description
 * A card component for displaying detailed tenant information.
 * Automatically handles loading states and missing tenant.
 *
 * @param props - Component props
 * @returns Rendered card component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TenantCard />
 * ```
 *
 * @example
 * ```tsx
 * // With actions
 * <TenantCard
 *   actions={
 *     <Button variant="primary">Manage</Button>
 *   }
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom render
 * <TenantCard
 *   renderTenant={(tenant) => (
 *     <div>
 *       <h2>{tenant.name}</h2>
 *       <p>{tenant.description}</p>
 *     </div>
 *   )}
 * />
 * ```
 */
export const TenantCard: React.FC<TenantCardProps> = ({
  className,
  showLoading = true,
  loadingContent,
  noTenantContent,
  renderTenant,
  showId = false,
  showMetadata = true,
  actions,
}) => {
  const { tenant, isLoading } = useTenant();

  /**
   * Render loading state
   */
  if (isLoading && showLoading) {
    return (
      <Card className={className}>
        <Card.Content>
          {loadingContent || (
            <div className="text-center py-8 text-gray-500">Loading tenant information...</div>
          )}
        </Card.Content>
      </Card>
    );
  }

  /**
   * Render no tenant state
   */
  if (!tenant) {
    return (
      <Card className={className}>
        <Card.Content>
          {noTenantContent || (
            <div className="text-center py-8 text-gray-500">No tenant selected</div>
          )}
        </Card.Content>
      </Card>
    );
  }

  /**
   * Render custom content
   */
  if (renderTenant) {
    return (
      <Card className={className}>
        <Card.Content>{renderTenant(tenant)}</Card.Content>
        {actions && <Card.Footer>{actions}</Card.Footer>}
      </Card>
    );
  }

  /**
   * Render default content
   */
  return (
    <Card className={className}>
      <Card.Header>
        <h3 className="text-lg font-semibold">{tenant.name}</h3>
      </Card.Header>
      <Card.Content>
        {showId && (
          <div className="mb-2">
            <span className="text-sm text-gray-500">ID:</span>{' '}
            <span className="text-sm font-mono">{tenant.id}</span>
          </div>
        )}

        {tenant.slug && (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Slug:</span>{' '}
            <span className="text-sm">{tenant.slug}</span>
          </div>
        )}

        {tenant.subdomain && (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Subdomain:</span>{' '}
            <span className="text-sm">{tenant.subdomain}</span>
          </div>
        )}

        {tenant.customDomain && (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Domain:</span>{' '}
            <span className="text-sm">{tenant.customDomain}</span>
          </div>
        )}

        {showMetadata && tenant.createdAt && (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Created:</span>{' '}
            <span className="text-sm">{new Date(tenant.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </Card.Content>
      {actions && <Card.Footer>{actions}</Card.Footer>}
    </Card>
  );
};

export default TenantCard;
