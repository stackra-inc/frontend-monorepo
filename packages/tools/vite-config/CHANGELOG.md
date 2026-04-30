# Changelog

All notable changes to `@stackra/vite-config` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-04-29

### Added

- Initial public release to npm
- `defineConfig` helper with full IntelliSense for Stackra options
- Sensible mode-aware defaults (sourcemaps, log level, build target)
- Built-in plugins: env, typeGen, decorator discovery, ngrok tunnel, QR code
  terminal display
- Plugin toggle map for declarative enable/disable
- Deep merge of defaults → user overrides
- ESM + CJS dual output
- Full TypeScript support

### Changed

- Standardized configs, scripts, hooks, and CI workflows

## [1.0.0] - 2026-04-28

### Added

- Initial package setup
- `defineConfig`, `createDefaults`
- `decoratorDiscovery`, `ngrok`, `qrcode`, `env`, `typeGen` plugin factories
- Typed `StackraOptions` and `PluginMap` interfaces
