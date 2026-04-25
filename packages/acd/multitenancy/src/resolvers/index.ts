/**
 * Tenant Resolvers
 *
 * Export all tenant resolver implementations.
 */

export { DomainResolver } from './domain.resolver';
export { DynamicDomainResolver } from './dynamic-domain.resolver';
export { HeaderResolver } from './header.resolver';
export { QueryResolver } from './query.resolver';
export { RouterResolver } from './router.resolver';
export { ServerDomainResolver } from './server-domain.resolver';
export { SubdomainResolver } from './subdomain.resolver';

export type { DynamicDomainResolverConfig } from '@/interfaces/dynamic-domain-resolver-config.interface';
