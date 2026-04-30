/**
 * Decorator Discovery Plugin Wrapper
 *
 * Provides the decorator discovery Vite plugin factory and types.
 * The plugin scans TypeScript files at build time for decorator usage
 * and generates virtual modules containing decorator registries.
 *
 * @module plugins/decorator-discovery
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
  args: unknown[];
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
  /** Glob patterns to include */
  include?: string[];
  /** Glob patterns to exclude */
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
 */
export class DecoratorScanner {
  private registry: DecoratorRegistry = {
    modules: [],
    providers: [],
    subscribers: [],
    custom: new Map(),
  };

  constructor(private readonly options: Required<DecoratorDiscoveryOptions>) {}

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
      this.scanFile(file);
    }

    if (this.options.debug) {
      console.log(`[DecoratorDiscovery] Found:`);
      console.log(`  - ${this.registry.modules.length} @Module decorators`);
      console.log(`  - ${this.registry.providers.length} @Injectable decorators`);
      console.log(`  - ${this.registry.subscribers.length} @Subscribe decorators`);
    }

    return this.registry;
  }

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

    return [...new Set(allFiles)];
  }

  private scanFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes('@')) {
      return;
    }

    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
    this.visitNode(sourceFile, filePath);
  }

  private visitNode(node: ts.Node, filePath: string): void {
    if (ts.isClassDeclaration(node)) {
      this.scanClassDecorators(node, filePath);
    }

    ts.forEachChild(node, (child) => this.visitNode(child, filePath));
  }

  private scanClassDecorators(node: ts.ClassDeclaration, filePath: string): void {
    const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;

    if (!decorators || decorators.length === 0) return;

    const className = node.name?.text ?? 'AnonymousClass';

    for (const decorator of decorators) {
      const metadata = this.extractDecoratorMetadata(decorator, className, filePath);
      if (metadata) this.addToRegistry(metadata);
    }
  }

  private extractDecoratorMetadata(
    decorator: ts.Decorator,
    className: string,
    filePath: string
  ): DecoratorMetadata | null {
    const expression = decorator.expression;

    let decoratorName: string;
    const args: unknown[] = [];

    if (ts.isCallExpression(expression)) {
      decoratorName = expression.expression.getText();
    } else if (ts.isIdentifier(expression)) {
      decoratorName = expression.text;
    } else {
      return null;
    }

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

    if (!knownDecorators.includes(decoratorName)) return null;

    return {
      name: decoratorName,
      className,
      filePath: path.relative(this.options.root, filePath),
      args,
    };
  }

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
  generateModulesRegistry(modules: DecoratorMetadata[]): string {
    return `export const MODULE_REGISTRY = ${JSON.stringify(modules, null, 2)};`;
  }

  generateProvidersRegistry(providers: DecoratorMetadata[]): string {
    return `export const PROVIDER_REGISTRY = ${JSON.stringify(providers, null, 2)};`;
  }

  generateSubscribersRegistry(subscribers: DecoratorMetadata[]): string {
    return `export const SUBSCRIBER_REGISTRY = ${JSON.stringify(subscribers, null, 2)};`;
  }

  generateAllRegistry(registry: DecoratorRegistry): string {
    return `export const DECORATOR_REGISTRY = ${JSON.stringify(
      {
        modules: registry.modules,
        providers: registry.providers,
        subscribers: registry.subscribers,
      },
      null,
      2
    )};`;
  }
}

// ============================================================================
// Vite Plugin Factory
// ============================================================================

/**
 * Create the decorator discovery Vite plugin.
 *
 * @param options - Plugin configuration options
 * @returns Configured Vite Plugin instance
 *
 * @example
 * ```typescript
 * import { decoratorDiscovery } from '@stackra/vite-config';
 *
 * export default defineConfig({
 *   plugins: [
 *     decoratorDiscovery({ debug: true }),
 *   ],
 * });
 * ```
 */
export function decoratorDiscovery(options: DecoratorDiscoveryOptions = {}): Plugin {
  const resolvedOptions: Required<DecoratorDiscoveryOptions> = {
    root: options.root ?? process.cwd(),
    include: options.include ?? [
      'packages/*/src/**/*.ts',
      'packages/*/src/**/*.tsx',
      'apps/*/src/**/*.ts',
      'apps/*/src/**/*.tsx',
    ],
    exclude: options.exclude ?? [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/node_modules/**',
      '**/dist/**',
    ],
    debug: options.debug ?? false,
    customDecorators: options.customDecorators ?? [],
  };

  let registry: DecoratorRegistry | null = null;
  const generator = new RegistryCodeGenerator();

  async function scanDecorators(): Promise<void> {
    const scanner = new DecoratorScanner(resolvedOptions);
    registry = await scanner.scan();
  }

  return {
    name: 'vite-plugin-decorator-discovery',

    async buildStart() {
      await scanDecorators();
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_MODULE_PREFIX)) {
        return '\0' + id;
      }
      return null;
    },

    load(id) {
      if (!registry) return null;

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
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const content = fs.readFileSync(file, 'utf-8');
      if (!content.includes('@')) return;

      await scanDecorators();

      const virtualModules = Object.values(VIRTUAL_MODULES).map((id) => '\0' + id);
      for (const moduleId of virtualModules) {
        const module = server.moduleGraph.getModuleById(moduleId);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }
      }

      server.ws.send({ type: 'full-reload', path: '*' });
    },
  };
}
