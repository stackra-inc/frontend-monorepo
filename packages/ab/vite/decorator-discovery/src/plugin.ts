/**
 * Decorator Discovery Vite Plugin
 *
 * Automatically scans TypeScript decorators at build time and generates
 * virtual modules containing decorator registries. Inspired by NestJS's
 * DiscoveryService but implemented as a compile-time Vite plugin.
 *
 * ## How it works:
 *
 * 1. **Build Start**: Scans all packages for decorator usage
 * 2. **Registry Generation**: Creates virtual modules with decorator metadata
 * 3. **HMR Support**: Watches for decorator changes and regenerates
 * 4. **Virtual Modules**: Exposes registries via `virtual:decorator-registry/*`
 *
 * ## Virtual Modules:
 *
 * - `virtual:decorator-registry/modules` — All @Module decorators
 * - `virtual:decorator-registry/providers` — All @Injectable decorators
 * - `virtual:decorator-registry/subscribers` — All @Subscribe decorators
 * - `virtual:decorator-registry/all` — Combined registry
 *
 * @module vite/decorator-discovery
 */

import type { Plugin } from 'vite';
import { glob } from 'glob';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

/**
 * Decorator metadata extracted from a class.
 */
export interface DecoratorMetadata {
  /** Decorator name (e.g., 'Module', 'Injectable', 'Subscribe') */
  name: string;
  /** Class name that was decorated */
  className: string;
  /** File path where the decorator was found */
  filePath: string;
  /** Decorator arguments (parsed from AST) */
  args: any[];
  /** Method name (for method decorators) */
  methodName?: string;
  /** Unique metadata key (for DiscoveryService.createDecorator pattern) */
  metadataKey?: string;
}

/**
 * Registry of all discovered decorators, grouped by type.
 */
export interface DecoratorRegistry {
  modules: DecoratorMetadata[];
  providers: DecoratorMetadata[];
  subscribers: DecoratorMetadata[];
  custom: Map<string, DecoratorMetadata[]>;
}

/**
 * Plugin configuration options.
 */
export interface DecoratorDiscoveryOptions {
  /** Root directory to scan (default: process.cwd()) */
  root?: string;
  /** Glob patterns to include (default: ['packages/*src/**\/*.ts', 'apps/*src/**\/*.ts']) */
  include?: string[];
  /** Glob patterns to exclude (default: ['**\/*.spec.ts', '**\/*.test.ts', '**\/node_modules/**']) */
  exclude?: string[];
  /** Enable debug logging */
  debug?: boolean;
  /** Custom decorator names to discover (in addition to built-ins) */
  customDecorators?: string[];
}

// ============================================================================
// Virtual Module IDs
// ============================================================================

const VIRTUAL_MODULE_PREFIX = 'virtual:decorator-registry';
const VIRTUAL_MODULES = {
  modules: `${VIRTUAL_MODULE_PREFIX}/modules`,
  providers: `${VIRTUAL_MODULE_PREFIX}/providers`,
  subscribers: `${VIRTUAL_MODULE_PREFIX}/subscribers`,
  all: `${VIRTUAL_MODULE_PREFIX}/all`,
} as const;

// ============================================================================
// Decorator Scanner
// ============================================================================

/**
 * Scans TypeScript files for decorator usage using the TypeScript Compiler API.
 *
 * Similar to NestJS's DiscoveryService but operates at build time instead of runtime.
 */
export class DecoratorScanner {
  private registry: DecoratorRegistry = {
    modules: [],
    providers: [],
    subscribers: [],
    custom: new Map(),
  };

  constructor(private readonly options: Required<DecoratorDiscoveryOptions>) {}

  /**
   * Scan all files matching the include patterns.
   */
  async scan(): Promise<DecoratorRegistry> {
    this.registry = {
      modules: [],
      providers: [],
      subscribers: [],
      custom: new Map(),
    };

    const files = await this.getFiles();

    if (this.options.debug) {
      console.log(`[DecoratorDiscovery] Scanning ${files.length} files...`);
    }

    for (const file of files) {
      await this.scanFile(file);
    }

    if (this.options.debug) {
      console.log(`[DecoratorDiscovery] Found:`);
      console.log(`  - ${this.registry.modules.length} @Module decorators`);
      console.log(`  - ${this.registry.providers.length} @Injectable decorators`);
      console.log(`  - ${this.registry.subscribers.length} @Subscribe decorators`);
      for (const [name, items] of this.registry.custom) {
        console.log(`  - ${items.length} @${name} decorators`);
      }
    }

    return this.registry;
  }

  /**
   * Get all files to scan based on include/exclude patterns.
   */
  private async getFiles(): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of this.options.include) {
      const files = await glob(pattern, {
        cwd: this.options.root,
        absolute: true,
        ignore: this.options.exclude,
      });
      allFiles.push(...files);
    }

    return [...new Set(allFiles)]; // deduplicate
  }

  /**
   * Scan a single TypeScript file for decorators.
   */
  private async scanFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Quick check: skip files without decorators
    if (!content.includes('@')) {
      return;
    }

    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

    this.visitNode(sourceFile, filePath);
  }

  /**
   * Recursively visit AST nodes to find decorators.
   */
  private visitNode(node: ts.Node, filePath: string): void {
    if (ts.isClassDeclaration(node)) {
      this.scanClassDecorators(node, filePath);
      this.scanMethodDecorators(node, filePath);
    }

    ts.forEachChild(node, (child) => this.visitNode(child, filePath));
  }

  /**
   * Scan class-level decorators.
   */
  private scanClassDecorators(node: ts.ClassDeclaration, filePath: string): void {
    const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;

    if (!decorators || decorators.length === 0) {
      return;
    }

    const className = node.name?.text ?? 'AnonymousClass';

    for (const decorator of decorators) {
      const metadata = this.extractDecoratorMetadata(decorator, className, filePath);

      if (metadata) {
        this.addToRegistry(metadata);
      }
    }
  }

  /**
   * Scan method-level decorators.
   */
  private scanMethodDecorators(classNode: ts.ClassDeclaration, filePath: string): void {
    const className = classNode.name?.text ?? 'AnonymousClass';

    for (const member of classNode.members) {
      if (!ts.isMethodDeclaration(member)) {
        continue;
      }

      const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;

      if (!decorators || decorators.length === 0) {
        continue;
      }

      const methodName = member.name?.getText() ?? 'anonymousMethod';

      for (const decorator of decorators) {
        const metadata = this.extractDecoratorMetadata(decorator, className, filePath, methodName);

        if (metadata) {
          this.addToRegistry(metadata);
        }
      }
    }
  }

  /**
   * Extract metadata from a decorator node.
   */
  private extractDecoratorMetadata(
    decorator: ts.Decorator,
    className: string,
    filePath: string,
    methodName?: string
  ): DecoratorMetadata | null {
    const expression = decorator.expression;

    let decoratorName: string;
    let args: any[] = [];

    if (ts.isCallExpression(expression)) {
      // @Decorator(args)
      decoratorName = expression.expression.getText();
      args = this.extractArguments(expression);
    } else if (ts.isIdentifier(expression)) {
      // @Decorator
      decoratorName = expression.text;
    } else {
      return null;
    }

    // Filter: only track known decorators
    const knownDecorators = [
      'Module',
      'Injectable',
      'Subscribe',
      'AsSubscriber',
      'Global',
      'Inject',
      'Optional',
      ...this.options.customDecorators,
    ];

    if (!knownDecorators.includes(decoratorName)) {
      return null;
    }

    return {
      name: decoratorName,
      className,
      filePath: path.relative(this.options.root, filePath),
      args,
      methodName,
    };
  }

  /**
   * Extract arguments from a decorator call expression.
   */
  private extractArguments(expression: ts.CallExpression): any[] {
    const args: any[] = [];

    for (const arg of expression.arguments) {
      try {
        // Try to evaluate simple literals
        if (ts.isStringLiteral(arg)) {
          args.push(arg.text);
        } else if (ts.isNumericLiteral(arg)) {
          args.push(Number(arg.text));
        } else if (arg.kind === ts.SyntaxKind.TrueKeyword) {
          args.push(true);
        } else if (arg.kind === ts.SyntaxKind.FalseKeyword) {
          args.push(false);
        } else if (ts.isObjectLiteralExpression(arg)) {
          args.push(this.extractObjectLiteral(arg));
        } else if (ts.isArrayLiteralExpression(arg)) {
          args.push(this.extractArrayLiteral(arg));
        } else {
          // Complex expression — store as string
          args.push(arg.getText());
        }
      } catch {
        args.push(arg.getText());
      }
    }

    return args;
  }

  /**
   * Extract object literal as plain object.
   */
  private extractObjectLiteral(node: ts.ObjectLiteralExpression): Record<string, any> {
    const obj: Record<string, any> = {};

    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name.getText();
        const value = prop.initializer;

        if (ts.isStringLiteral(value)) {
          obj[key] = value.text;
        } else if (ts.isNumericLiteral(value)) {
          obj[key] = Number(value.text);
        } else if (value.kind === ts.SyntaxKind.TrueKeyword) {
          obj[key] = true;
        } else if (value.kind === ts.SyntaxKind.FalseKeyword) {
          obj[key] = false;
        } else if (ts.isArrayLiteralExpression(value)) {
          obj[key] = this.extractArrayLiteral(value);
        } else {
          obj[key] = value.getText();
        }
      }
    }

    return obj;
  }

  /**
   * Extract array literal as plain array.
   */
  private extractArrayLiteral(node: ts.ArrayLiteralExpression): any[] {
    return node.elements.map((el) => {
      if (ts.isStringLiteral(el)) {
        return el.text;
      } else if (ts.isNumericLiteral(el)) {
        return Number(el.text);
      } else {
        return el.getText();
      }
    });
  }

  /**
   * Add metadata to the appropriate registry bucket.
   */
  private addToRegistry(metadata: DecoratorMetadata): void {
    switch (metadata.name) {
      case 'Module':
        this.registry.modules.push(metadata);
        break;
      case 'Injectable':
        this.registry.providers.push(metadata);
        break;
      case 'Subscribe':
      case 'AsSubscriber':
        this.registry.subscribers.push(metadata);
        break;
      default:
        if (!this.registry.custom.has(metadata.name)) {
          this.registry.custom.set(metadata.name, []);
        }
        this.registry.custom.get(metadata.name)!.push(metadata);
    }
  }
}

// ============================================================================
// Registry Code Generator
// ============================================================================

/**
 * Generates TypeScript code for virtual modules.
 */
export class RegistryCodeGenerator {
  /**
   * Generate code for the modules registry.
   */
  generateModulesRegistry(modules: DecoratorMetadata[]): string {
    return `
// AUTO-GENERATED by @stackra/vite-decorator-discovery
// Do not edit manually

export interface ModuleMetadata {
  name: string;
  className: string;
  filePath: string;
  args: any[];
}

export const MODULE_REGISTRY: ModuleMetadata[] = ${JSON.stringify(modules, null, 2)};

export function getModuleByClassName(className: string): ModuleMetadata | undefined {
  return MODULE_REGISTRY.find(m => m.className === className);
}

export function getAllModules(): ModuleMetadata[] {
  return MODULE_REGISTRY;
}
`;
  }

  /**
   * Generate code for the providers registry.
   */
  generateProvidersRegistry(providers: DecoratorMetadata[]): string {
    return `
// AUTO-GENERATED by @stackra/vite-decorator-discovery
// Do not edit manually

export interface ProviderMetadata {
  name: string;
  className: string;
  filePath: string;
  args: any[];
}

export const PROVIDER_REGISTRY: ProviderMetadata[] = ${JSON.stringify(providers, null, 2)};

export function getProviderByClassName(className: string): ProviderMetadata | undefined {
  return PROVIDER_REGISTRY.find(p => p.className === className);
}

export function getAllProviders(): ProviderMetadata[] {
  return PROVIDER_REGISTRY;
}
`;
  }

  /**
   * Generate code for the subscribers registry.
   */
  generateSubscribersRegistry(subscribers: DecoratorMetadata[]): string {
    return `
// AUTO-GENERATED by @stackra/vite-decorator-discovery
// Do not edit manually

export interface SubscriberMetadata {
  name: string;
  className: string;
  filePath: string;
  args: any[];
  methodName?: string;
}

export const SUBSCRIBER_REGISTRY: SubscriberMetadata[] = ${JSON.stringify(subscribers, null, 2)};

export function getSubscribersByClassName(className: string): SubscriberMetadata[] {
  return SUBSCRIBER_REGISTRY.filter(s => s.className === className);
}

export function getSubscribersByTopic(topic: string): SubscriberMetadata[] {
  return SUBSCRIBER_REGISTRY.filter(s => {
    const topicArg = s.args[0];
    return typeof topicArg === 'string' && topicArg === topic;
  });
}

export function getAllSubscribers(): SubscriberMetadata[] {
  return SUBSCRIBER_REGISTRY;
}
`;
  }

  /**
   * Generate code for the combined registry.
   */
  generateAllRegistry(registry: DecoratorRegistry): string {
    const customEntries = Array.from(registry.custom.entries()).map(([name, items]) => ({
      name,
      items,
    }));

    return `
// AUTO-GENERATED by @stackra/vite-decorator-discovery
// Do not edit manually

export interface DecoratorMetadata {
  name: string;
  className: string;
  filePath: string;
  args: any[];
  methodName?: string;
}

export interface DecoratorRegistry {
  modules: DecoratorMetadata[];
  providers: DecoratorMetadata[];
  subscribers: DecoratorMetadata[];
  custom: Map<string, DecoratorMetadata[]>;
}

export const DECORATOR_REGISTRY: DecoratorRegistry = {
  modules: ${JSON.stringify(registry.modules, null, 2)},
  providers: ${JSON.stringify(registry.providers, null, 2)},
  subscribers: ${JSON.stringify(registry.subscribers, null, 2)},
  custom: new Map(${JSON.stringify(customEntries, null, 2)}),
};

export function getDecoratorsByName(name: string): DecoratorMetadata[] {
  switch (name) {
    case 'Module':
      return DECORATOR_REGISTRY.modules;
    case 'Injectable':
      return DECORATOR_REGISTRY.providers;
    case 'Subscribe':
    case 'AsSubscriber':
      return DECORATOR_REGISTRY.subscribers;
    default:
      return DECORATOR_REGISTRY.custom.get(name) ?? [];
  }
}

export function getAllDecorators(): DecoratorMetadata[] {
  return [
    ...DECORATOR_REGISTRY.modules,
    ...DECORATOR_REGISTRY.providers,
    ...DECORATOR_REGISTRY.subscribers,
    ...Array.from(DECORATOR_REGISTRY.custom.values()).flat(),
  ];
}
`;
  }
}

// ============================================================================
// Vite Plugin
// ============================================================================

/**
 * Vite plugin for decorator discovery and virtual module generation.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { decoratorDiscoveryPlugin } from '@stackra/vite-decorator-discovery';
 *
 * export default defineConfig({
 *   plugins: [
 *     decoratorDiscoveryPlugin({
 *       debug: true,
 *       customDecorators: ['MyCustomDecorator'],
 *     }),
 *   ],
 * });
 * ```
 */
export function decoratorDiscoveryPlugin(options: DecoratorDiscoveryOptions = {}): Plugin {
  const resolvedOptions: Required<DecoratorDiscoveryOptions> = {
    root: options.root ?? process.cwd(),
    include: options.include ?? [
      'packages/*src/**/*.ts',
      'packages/*src/**/*.tsx',
      'apps/*src/**/*.ts',
      'apps/*src/**/*.tsx',
    ],
    exclude: options.exclude ?? [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
    ],
    debug: options.debug ?? false,
    customDecorators: options.customDecorators ?? [],
  };

  let registry: DecoratorRegistry | null = null;
  const generator = new RegistryCodeGenerator();

  /**
   * Scan decorators and update registry.
   */
  async function scanDecorators(): Promise<void> {
    const scanner = new DecoratorScanner(resolvedOptions);
    registry = await scanner.scan();
  }

  return {
    name: 'vite-plugin-decorator-discovery',

    async buildStart() {
      console.log('🔍 [DecoratorDiscovery] Scanning decorators...');
      await scanDecorators();
      console.log('✓ [DecoratorDiscovery] Registry generated');
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_MODULE_PREFIX)) {
        return '\0' + id; // Vite convention: prefix with \0 for virtual modules
      }
      return null;
    },

    load(id) {
      if (!registry) {
        return null;
      }

      // Remove \0 prefix
      const cleanId = id.startsWith('\0') ? id.slice(1) : id;

      switch (cleanId) {
        case VIRTUAL_MODULES.modules:
          return generator.generateModulesRegistry(registry.modules);

        case VIRTUAL_MODULES.providers:
          return generator.generateProvidersRegistry(registry.providers);

        case VIRTUAL_MODULES.subscribers:
          return generator.generateSubscribersRegistry(registry.subscribers);

        case VIRTUAL_MODULES.all:
          return generator.generateAllRegistry(registry);

        default:
          return null;
      }
    },

    async handleHotUpdate({ file, server }) {
      // Only regenerate if a TypeScript file with decorators changed
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
        return;
      }

      const content = fs.readFileSync(file, 'utf-8');
      if (!content.includes('@')) {
        return;
      }

      if (resolvedOptions.debug) {
        console.log(`🔄 [DecoratorDiscovery] Decorator file changed: ${file}`);
      }

      // Rescan decorators
      await scanDecorators();

      // Invalidate all virtual modules
      const virtualModules = Object.values(VIRTUAL_MODULES).map((id) => '\0' + id);

      for (const moduleId of virtualModules) {
        const module = server.moduleGraph.getModuleById(moduleId);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }
      }

      // Trigger HMR
      server.ws.send({
        type: 'full-reload',
        path: '*',
      });
    },
  };
}
