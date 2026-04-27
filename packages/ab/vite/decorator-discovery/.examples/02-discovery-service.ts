/**
 * Example: NestJS-style DiscoveryService Implementation
 *
 * This example shows how to create a DiscoveryService similar to NestJS's
 * using the virtual modules from the decorator discovery plugin.
 */

import { MODULE_REGISTRY, type ModuleMetadata } from "virtual:decorator-registry/modules";
import { PROVIDER_REGISTRY, type ProviderMetadata } from "virtual:decorator-registry/providers";
import {
  SUBSCRIBER_REGISTRY,
  type SubscriberMetadata,
} from "virtual:decorator-registry/subscribers";
import { DECORATOR_REGISTRY } from "virtual:decorator-registry/all";

// ============================================================================
// DiscoveryService (NestJS-style)
// ============================================================================

/**
 * Discovery service for querying decorator metadata.
 *
 * Inspired by NestJS's DiscoveryService but uses compile-time registries
 * instead of runtime reflection.
 */
export class DiscoveryService {
  /**
   * Get all providers (classes decorated with @Injectable).
   *
   * @param options - Filter options
   * @returns Array of provider metadata
   */
  getProviders(options?: {
    /** Filter by metadata key (for custom decorators) */
    metadataKey?: string;
    /** Filter by package/module path */
    include?: string[];
  }): ProviderMetadata[] {
    let providers = [...PROVIDER_REGISTRY];

    // Filter by metadata key
    if (options?.metadataKey) {
      const customDecorators = DECORATOR_REGISTRY.custom.get(options.metadataKey);
      if (customDecorators) {
        const classNames = new Set(customDecorators.map((d) => d.className));
        providers = providers.filter((p) => classNames.has(p.className));
      } else {
        return [];
      }
    }

    // Filter by include paths
    if (options?.include && options.include.length > 0) {
      providers = providers.filter((p) =>
        options.include!.some((pattern) => p.filePath.includes(pattern)),
      );
    }

    return providers;
  }

  /**
   * Get all modules (classes decorated with @Module).
   *
   * @param options - Filter options
   * @returns Array of module metadata
   */
  getModules(options?: {
    /** Filter by package/module path */
    include?: string[];
  }): ModuleMetadata[] {
    let modules = [...MODULE_REGISTRY];

    // Filter by include paths
    if (options?.include && options.include.length > 0) {
      modules = modules.filter((m) =>
        options.include!.some((pattern) => m.filePath.includes(pattern)),
      );
    }

    return modules;
  }

  /**
   * Get all subscribers (classes/methods decorated with @Subscribe or @AsSubscriber).
   *
   * @param options - Filter options
   * @returns Array of subscriber metadata
   */
  getSubscribers(options?: {
    /** Filter by topic pattern */
    topic?: string | RegExp;
    /** Filter by package/module path */
    include?: string[];
  }): SubscriberMetadata[] {
    let subscribers = [...SUBSCRIBER_REGISTRY];

    // Filter by topic
    if (options?.topic) {
      if (typeof options.topic === "string") {
        subscribers = subscribers.filter((s) => {
          const topic = s.args[0];
          return typeof topic === "string" && topic === options.topic;
        });
      } else {
        subscribers = subscribers.filter((s) => {
          const topic = s.args[0];
          return typeof topic === "string" && options.topic!.test(topic);
        });
      }
    }

    // Filter by include paths
    if (options?.include && options.include.length > 0) {
      subscribers = subscribers.filter((s) =>
        options.include!.some((pattern) => s.filePath.includes(pattern)),
      );
    }

    return subscribers;
  }

  /**
   * Get metadata by decorator name.
   *
   * @param decoratorName - Name of the decorator (e.g., 'Module', 'Injectable')
   * @returns Array of decorator metadata
   */
  getMetadataByDecorator(decoratorName: string) {
    switch (decoratorName) {
      case "Module":
        return DECORATOR_REGISTRY.modules;
      case "Injectable":
        return DECORATOR_REGISTRY.providers;
      case "Subscribe":
      case "AsSubscriber":
        return DECORATOR_REGISTRY.subscribers;
      default:
        return DECORATOR_REGISTRY.custom.get(decoratorName) ?? [];
    }
  }

  /**
   * Find a provider by class name.
   *
   * @param className - The class name to search for
   * @returns Provider metadata or undefined
   */
  findProviderByClassName(className: string): ProviderMetadata | undefined {
    return PROVIDER_REGISTRY.find((p) => p.className === className);
  }

  /**
   * Find a module by class name.
   *
   * @param className - The class name to search for
   * @returns Module metadata or undefined
   */
  findModuleByClassName(className: string): ModuleMetadata | undefined {
    return MODULE_REGISTRY.find((m) => m.className === className);
  }

  /**
   * Get all method handlers for a specific class.
   *
   * @param className - The class name to search for
   * @returns Array of subscriber metadata for methods in the class
   */
  getMethodHandlers(className: string): SubscriberMetadata[] {
    return SUBSCRIBER_REGISTRY.filter(
      (s) => s.className === className && s.methodName !== undefined,
    );
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

const discovery = new DiscoveryService();

// Example 1: Get all providers
console.log("=== All Providers ===");
const allProviders = discovery.getProviders();
console.log(`Found ${allProviders.length} providers`);

// Example 2: Get providers from auth package
console.log("\n=== Auth Providers ===");
const authProviders = discovery.getProviders({
  include: ["packages/auth/"],
});
authProviders.forEach((p) => console.log(`- ${p.className}`));

// Example 3: Get all modules
console.log("\n=== All Modules ===");
const allModules = discovery.getModules();
allModules.forEach((m) => console.log(`- ${m.className}`));

// Example 4: Get subscribers for a specific topic
console.log("\n=== Login Subscribers ===");
const loginSubscribers = discovery.getSubscribers({
  topic: /login/,
});
loginSubscribers.forEach((s) => {
  console.log(`- ${s.className}.${s.methodName} → ${s.args[0]}`);
});

// Example 5: Find a specific provider
console.log("\n=== Find AuthService ===");
const authService = discovery.findProviderByClassName("AuthService");
if (authService) {
  console.log(`Found: ${authService.className} in ${authService.filePath}`);
}

// Example 6: Get method handlers for a class
console.log("\n=== WebhooksExplorer Handlers ===");
const webhookHandlers = discovery.getMethodHandlers("WebhooksExplorer");
webhookHandlers.forEach((h) => {
  console.log(`- ${h.methodName} → ${h.args[0]}`);
});

// Example 7: Get custom decorator metadata
console.log("\n=== Custom Decorators ===");
const customMeta = discovery.getMetadataByDecorator("MyCustomDecorator");
console.log(`Found ${customMeta.length} @MyCustomDecorator usages`);

// ============================================================================
// MetadataScanner (NestJS-style)
// ============================================================================

/**
 * Metadata scanner for discovering method handlers.
 *
 * Similar to NestJS's MetadataScanner but uses compile-time registries.
 */
export class MetadataScanner {
  /**
   * Get all method names for a class that have a specific decorator.
   *
   * @param className - The class name to scan
   * @param decoratorName - The decorator name to filter by (optional)
   * @returns Array of method names
   */
  getAllMethodNames(className: string, decoratorName?: string): string[] {
    let methods = SUBSCRIBER_REGISTRY.filter(
      (s) => s.className === className && s.methodName !== undefined,
    );

    if (decoratorName) {
      methods = methods.filter((m) => m.name === decoratorName);
    }

    return methods.map((m) => m.methodName!);
  }

  /**
   * Scan a class for methods with a specific decorator and execute a callback.
   *
   * @param className - The class name to scan
   * @param decoratorName - The decorator name to filter by
   * @param callback - Callback to execute for each method
   * @returns Array of callback results
   */
  scanFromClass<T>(
    className: string,
    decoratorName: string,
    callback: (methodName: string, metadata: SubscriberMetadata) => T,
  ): T[] {
    const methods = SUBSCRIBER_REGISTRY.filter(
      (s) => s.className === className && s.methodName !== undefined && s.name === decoratorName,
    );

    return methods.map((m) => callback(m.methodName!, m));
  }
}

// ============================================================================
// Usage Example: WebhooksExplorer (from NestJS docs)
// ============================================================================

/**
 * Example from NestJS documentation:
 * https://docs.nestjs.com/fundamentals/discovery-service
 */
export class WebhooksExplorer {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  getWebhooks() {
    // Get all providers with @Webhook decorator
    const webhooks = this.discoveryService.getProviders({
      metadataKey: "Webhook",
    });

    return webhooks.map((wrapper) => {
      // Get the @Webhook metadata
      const webhookMeta = DECORATOR_REGISTRY.custom
        .get("Webhook")
        ?.find((d) => d.className === wrapper.className);

      const name = webhookMeta?.args[0] ?? wrapper.className;

      // Get all methods with @WebhookHandler
      const handlers = this.metadataScanner.scanFromClass(
        wrapper.className,
        "WebhookHandler",
        (methodName, metadata) => ({
          methodName,
          event: metadata.args[0],
        }),
      );

      return {
        name,
        handlers,
      };
    });
  }
}

// Usage
const webhooksExplorer = new WebhooksExplorer(new DiscoveryService(), new MetadataScanner());

console.log("\n=== Webhooks ===");
const webhooks = webhooksExplorer.getWebhooks();
webhooks.forEach((webhook) => {
  console.log(`\n${webhook.name}:`);
  webhook.handlers.forEach((handler) => {
    console.log(`  - ${handler.methodName} → ${handler.event}`);
  });
});
