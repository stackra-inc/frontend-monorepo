/**
 * TenantSwitcher Component
 *
 * A modal-based component for switching between tenants with search and filtering.
 * Built with HeroUI v3 Modal and ListBox components.
 *
 * @example
 * ```tsx
 * import { TenantSwitcher } from "@stackra/react-multitenancy";
 *
 * <TenantSwitcher />
 * ```
 */

import React, { useState, useMemo } from 'react';
import { Button, Modal, Input, ListBox } from '@heroui/react';
import { useTenant, useTenantSwitch } from '@/hooks';
import type { Tenant } from '@/types';

/**
 * Props for TenantSwitcher component
 */
export interface TenantSwitcherProps {
  /**
   * Button text to open the modal
   * @default "Switch Tenant"
   */
  buttonText?: string;

  /**
   * Modal title
   * @default "Select Tenant"
   */
  modalTitle?: string;

  /**
   * Search placeholder
   * @default "Search tenants..."
   */
  searchPlaceholder?: string;

  /**
   * Path to navigate to after switching tenant
   * Use :tenantId placeholder to inject the tenant ID
   *
   * @example "/dashboard/:tenantId"
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
   * Button variant
   * @default "primary"
   */
  buttonVariant?: 'primary' | 'secondary' | 'ghost' | 'outline';

  /**
   * Button size
   * @default "md"
   */
  buttonSize?: 'sm' | 'md' | 'lg';

  /**
   * Custom class name for the button
   */
  buttonClassName?: string;

  /**
   * Whether to show search input
   * @default true
   */
  showSearch?: boolean;

  /**
   * Whether to show tenant count
   * @default true
   */
  showCount?: boolean;

  /**
   * Custom render function for tenant items
   *
   * @param tenant - The tenant to render
   * @returns React node to display
   */
  renderTenant?: (tenant: Tenant) => React.ReactNode;

  /**
   * Filter function for tenants
   *
   * @param tenant - The tenant to filter
   * @param searchQuery - Current search query
   * @returns Whether to show the tenant
   */
  filterTenant?: (tenant: Tenant, searchQuery: string) => boolean;
}

/**
 * TenantSwitcher Component
 *
 * @description
 * A modal-based component for switching between tenants.
 * Includes search functionality and displays all available tenants.
 *
 * @param props - Component props
 * @returns Rendered switcher component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TenantSwitcher />
 * ```
 *
 * @example
 * ```tsx
 * // With navigation
 * <TenantSwitcher navigateTo="/dashboard/:tenantId" />
 * ```
 *
 * @example
 * ```tsx
 * // Custom styling
 * <TenantSwitcher
 *   buttonVariant="secondary"
 *   buttonSize="lg"
 *   buttonText="Change Organization"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom filter
 * <TenantSwitcher
 *   filterTenant={(tenant, query) => {
 *     return tenant.name.toLowerCase().includes(query.toLowerCase()) ||
 *            tenant.slug?.toLowerCase().includes(query.toLowerCase());
 *   }}
 * />
 * ```
 */
export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
  buttonText = 'Switch Tenant',
  modalTitle = 'Select Tenant',
  searchPlaceholder = 'Search tenants...',
  navigateTo,
  onTenantChange,
  onError,
  buttonVariant = 'primary',
  buttonSize: _buttonSize = 'md',
  buttonClassName,
  showSearch = true,
  showCount = true,
  renderTenant,
  filterTenant,
}) => {
  const { tenant, tenants } = useTenant();
  const { switchTenant, isSwitching } = useTenantSwitch({
    to: navigateTo,
    onSuccess: (tenantId) => {
      const switchedTenant = tenants.find((t) => t.id === tenantId);
      if (switchedTenant && onTenantChange) {
        onTenantChange(switchedTenant);
      }
      setIsOpen(false);
    },
    onError,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filter tenants based on search query
   */
  const filteredTenants = useMemo(() => {
    if (!searchQuery) {
      return tenants;
    }

    if (filterTenant) {
      return tenants.filter((t) => filterTenant(t, searchQuery));
    }

    // Default filter: search by name
    return tenants.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tenants, searchQuery, filterTenant]);

  /**
   * Handle tenant selection
   */
  const handleTenantSelect = async (tenantId: string) => {
    if (tenantId !== tenant?.id) {
      try {
        await switchTenant(tenantId);
      } catch (err) {
        console.error('[TenantSwitcher] Switch error:', err);
      }
    } else {
      setIsOpen(false);
    }
  };

  /**
   * Render tenant item
   */
  const renderTenantItem = (tenant: Tenant) => {
    if (renderTenant) {
      return renderTenant(tenant);
    }

    return (
      <div className="flex flex-col">
        <span className="font-medium">{tenant.name}</span>
        {tenant.slug && <span className="text-sm text-gray-500">{tenant.slug}</span>}
      </div>
    );
  };

  /**
   * Build modal title with count if enabled
   */
  const title = showCount ? `${modalTitle} (${filteredTenants.length})` : modalTitle;

  return (
    <>
      <Button
        variant={
          buttonVariant === 'primary'
            ? 'primary'
            : buttonVariant === 'secondary'
              ? 'secondary'
              : 'tertiary'
        }
        onPress={() => setIsOpen(true)}
        className={buttonClassName}
      >
        {buttonText}
      </Button>

      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {showSearch && (
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              )}

              {filteredTenants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No tenants found' : 'No tenants available'}
                </div>
              ) : (
                <ListBox
                  aria-label="Tenant list"
                  selectedKeys={tenant?.id ? [String(tenant.id)] : []}
                  selectionMode="single"
                  disabledKeys={isSwitching ? filteredTenants.map((t) => String(t.id)) : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    if (selectedKey) {
                      handleTenantSelect(selectedKey);
                    }
                  }}
                >
                  {filteredTenants.map((t) => (
                    <ListBox.Item key={String(t.id)} id={String(t.id)} textValue={t.name}>
                      {renderTenantItem(t)}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => setIsOpen(false)} isDisabled={isSwitching}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
};

export default TenantSwitcher;
