<p align="center">
  <img src=".github/assets/banner.svg" alt="@stackra/ts-desktop" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra/ts-desktop">
    <img src="https://img.shields.io/npm/v/@stackra/ts-desktop?style=flat-square&color=38bdf8&label=npm" alt="npm version" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-818cf8?style=flat-square" alt="MIT license" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://www.electronjs.org/">
    <img src="https://img.shields.io/badge/Electron-latest-47848f?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  </a>
</p>

---

# @stackra/ts-desktop

Electron desktop integration — menu decorators, window management, platform
bridge, and DI module. Brings NestJS-style DI to Electron main process code.

## Installation

```bash
pnpm add @stackra/ts-desktop
```

## Features

- 🖥️ `@Menu()` / `@MenuItem()` decorators for declarative menu building
- 🪟 `@Window()` decorator for window management
- 🌉 Platform bridge for renderer ↔ main IPC
- 💉 Full `@stackra/ts-container` DI support
- 🏗️ `DesktopModule.forRoot()` pattern
- 🔔 System tray integration
- ⌨️ Global shortcut registration

## Quick Start

```typescript
import { Module } from '@stackra/ts-container';
import { DesktopModule } from '@stackra/ts-desktop';

@Module({
  imports: [DesktopModule.forRoot()],
  providers: [FileMenu, EditMenu, MainWindow],
})
export class AppModule {}
```

```typescript
import { Menu, MenuItem, Injectable } from '@stackra/ts-desktop';

@Menu({ label: 'File' })
@Injectable()
class FileMenu {
  @MenuItem({ label: 'Open', accelerator: 'CmdOrCtrl+O' })
  open() {
    // handle open
  }

  @MenuItem({ label: 'Save', accelerator: 'CmdOrCtrl+S' })
  save() {
    // handle save
  }
}
```

## License

MIT © [Stackra](https://github.com/stackra-inc)
