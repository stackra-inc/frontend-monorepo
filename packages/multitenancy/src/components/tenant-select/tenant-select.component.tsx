/**
 * TenantSelect Component
 *
 * A dropdown component for selecting and switching between tenants.
 * Built with HeroUI v3 Select component.
 *
 * @example
 * ```tsx
 * import { TenantSelect } from "@stackra/react-multitenancy";
 *
 * <TenantSelect />
 * ```
 */

import React from 'react';
import { Label, ListBox, Select } from '@heroui/react';
import { useTenant, useTenantSwitch } from '@/hooks';
import type { Tenant } from '@/types';

/**
 * Props for TenantSelect component
 */
export interface TenantSelectProps {
  /**
   * Label for the select component
   * @default "Select Tenant"
   */
  label?: string;

  /**
   * Placeholder text when no tenant is selected
   * @default "Choose a tenant"
   */
  placeholder?: string;

  /**
   * Path to navigate to after switching tenant
   * Use :tenantId placeholder to inject the tenant ID
   *
   * @example "/dashboard/:tenantId"
   * @example "/:tenantId/products"
   */
  navigateTo?: string;

  /**
   * Callback function called after successful tenant switch
   *
   * @param tenant - The tenant that was switched to
   */
  onTenantChange?: (tenant: Tenant) => void;

  /**
   * Callback function called if tenant switch fails
   *
   * @param error - Error that occurred during switch
   */
  onError?: (error: Error) => void;

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom class name for the select component
   */
  className?: string;

  /**
   * Whether to show loading state
   * @default true
   */
  showLoading?: boolean;

  /**
   * Custom loading text
   * @default "Loading tenants..."
   */
  loadingText?: string;

  /**
   * Custom error text
   * @default "Failed to load tenants"
   */
  errorText?: string;

  /**
   * Whether to show tenant count in label
   * @default false
   */
  showCount?: boolean;

  /**
   * Custom render function for tenant items
   *
   * @param tenant - The tenant to render
   * @returns React node to display
   */
  renderTenant?: (tenant: Tenant) => React.ReactNode;
}

/**
 * TenantSelect Component
 *
 * @description
 * A dropdown component for selecting and switching between tenants.
 * Automatically handles loading states, errors, and tenant switching.
 *
 * @param props - Component props
 * @returns Rendered select component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TenantSelect />
 * ```
 *
 * @example
 * ```tsx
 * // With navigation
 * <TenantSelect navigateTo="/dashboard/:tenantId" />
 * ```
 *
 * @example
 * ```tsx
 * // With callbacks
 * <TenantSelect
 *   onTenantChange={(tenant) => {
 *     console.log("Switched to:", tenant.name);
 *   }}
 *   onError={(error) => {
 *     console.error("Switch failed:", error);
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom styling
 * <TenantSelect
 *   variant="secondary"
 *   size="lg"
 *   className="my-custom-class"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom render
 * <TenantSelect
 *   renderTenant={(tenant) => (
 *     <div>
 *       <strong>{tenant.name}</strong>
 *       <span>{tenant.slug}</span>
 *     </div>
 *   )}
 * />
 * ```
 */
export const TenantSelect: React.FC<TenantSelectProps> = ({
  label = 'Select Tenant',
  placeholder = 'Choose a tenant',
  navigateTo,
  onTenantChange,
  onError,
  disabled = false,
  className,
  showLoading = true,
  loadingText = 'Loading tenants...',
  errorText = 'Failed to load tenants',
  showCount = false,
  renderTenant,
}) => {
  const { tenant, tenants, isLoading, error } = useTenant();
  const { switchTenant, isSwitching } = useTenantSwitch({
    to: navigateTo,
    onSuccess: (tenantId) => {
      const switchedTenant = tenants.find((t) => t.id === tenantId);
      if (switchedTenant && onTenantChange) {
        onTenantChange(switchedTenant);
      }
    },
    onError,
  });

  /**
   * Handle tenant selection
   */
  const handleSelectionChange = async (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;
    if (selectedKey && selectedKey !== tenant?.id) {
      try {
        await switchTenant(selectedKey);
      } catch (err) {
        // Error is handled by useTenantSwitch
        console.error('[TenantSelect] Switch error:', err);
      }
    }
  };

  /**
   * Render tenant item
   */
  const renderTenantItem = (tenant: Tenant) => {
    if (renderTenant) {
      return renderTenant(tenant);
    }
    return tenant.name;
  };

  /**
   * Build label with count if enabled
   */
  const selectLabel = showCount && tenants.length > 0 ? `${label} (${tenants.length})` : label;

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <Select className={className} placeholder={loadingText} isDisabled>
        <Label>{selectLabel}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="loading" textValue={loadingText}>
              {loadingText}
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    );
  }

  // Show error state
  if (error) {
    return (
      <Select className={className} placeholder={errorText} isDisabled>
        <Label>{selectLabel}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="error" textValue={errorText}>
              {errorText}
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    );
  }

  // Show empty state
  if (tenants.length === 0) {
    return (
      <Select className={className} placeholder="No tenants available" isDisabled>
        <Label>{selectLabel}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="empty" textValue="No tenants available">
              No tenants available
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    );
  }

  // Render select with tenants
  return (
    <Select
      className={className}
      placeholder={placeholder}
      value={tenant?.id ? String(tenant.id) : null}
      onChange={(value) => {
        if (value && value !== tenant?.id) {
          handleSelectionChange(new Set([value]));
        }
      }}
      isDisabled={disabled || isSwitching}
    >
      <Label>{selectLabel}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {tenants.map((t) => (
            <ListBox.Item key={String(t.id)} id={String(t.id)} textValue={t.name}>
              {renderTenantItem(t)}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};

export default TenantSelect;
