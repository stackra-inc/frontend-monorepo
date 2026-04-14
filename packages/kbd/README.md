# @abdokouta/kbd

Keyboard shortcut display and management system for Refine applications, fully integrated with HeroUI v3.

## Features

- 🎨 **HeroUI Integration** - Seamless integration with HeroUI v3 design system
- ⌨️ **Keyboard Shortcut Registry** - Centralized registry for managing all keyboard shortcuts
- 🔧 **Platform-Specific Keys** - Automatic platform detection and key resolution (macOS, Windows, Linux)
- 🎯 **Context-Aware** - Shortcuts can be scoped to specific contexts (global, editor, modal, etc.)
- 🔄 **Alternative Keys** - Support for multiple key combinations per shortcut
- 📦 **Built-in Shortcuts** - Pre-configured common shortcuts ready to use
- 🎭 **Priority System** - Handle shortcut conflicts with priority levels
- 🪝 **React Hooks** - Easy-to-use hooks for registering and managing shortcuts
- 🧩 **Components** - Ready-to-use components for displaying shortcuts
- 📱 **Responsive** - Works across all device sizes
- ♿ **Accessible** - ARIA-compliant keyboard shortcut displays

## Installation

```bash
npm install @abdokouta/kbd
# or
yarn add @abdokouta/kbd
# or
pnpm add @abdokouta/kbd
```

## Quick Start

### Basic Usage

Display keyboard shortcuts in your UI:

```tsx
import { RefineKbd } from "@abdokouta/kbd";

function MyComponent() {
  return (
    <p>
      Press <RefineKbd keys={["command", "K"]} /> to open search
    </p>
  );
}
```

### Using the Registry

Register and use keyboard shortcuts:

```tsx
import { KbdModule, useShortcut } from "@abdokouta/kbd";

// Register a shortcut (typically in your app initialization)
KbdModule.register({
  id: "search.open",
  name: "Open Search",
  description: "Open the global search dialog",
  category: "search",
  context: "global",
  keys: {
    mac: ["command", "K"],
    windows: ["ctrl", "K"],
    linux: ["ctrl", "K"],
  },
  callback: () => {
    // Your search logic
    openSearch();
  },
});

// Use the shortcut in a component
function SearchButton() {
  useShortcut({
    id: "search.open",
    callback: () => openSearch(),
  });

  return <button>Search</button>;
}
```

### Built-in Shortcuts

The package includes pre-configured shortcuts for common actions:

```tsx
import { KbdModule } from "@abdokouta/kbd";

// Initialize with built-in shortcuts
KbdModule.configure({
  registerBuiltIn: true,
  debug: false,
});

// Built-in shortcuts include:
// - Navigation (go back, go forward, go home)
// - Search (open search, find in page)
// - Editing (save, undo, redo, copy, paste, cut)
// - View (toggle sidebar, fullscreen, zoom)
// - Help (show shortcuts, open help)
// - Modals (close, confirm)
```

## Core Concepts

### Keyboard Shortcut Registry

The registry is a centralized store for all keyboard shortcuts in your application:

```tsx
import { KbdModule } from "@abdokouta/kbd";

// Register a shortcut
KbdModule.register({
  id: "unique-id",
  name: "Shortcut Name",
  description: "What this shortcut does",
  category: "navigation", // navigation, editing, search, view, file, help, custom
  context: "global", // global, editor, list, modal, form, custom
  keys: ["ctrl", "S"], // Simple keys
  // OR platform-specific keys
  keys: {
    mac: ["command", "S"],
    windows: ["ctrl", "S"],
    linux: ["ctrl", "S"],
  },
  callback: () => {
    // Your logic here
  },
});

// Get a shortcut
const shortcut = KbdModule.get("unique-id");

// Get all shortcuts
const allShortcuts = KbdModule.getAll();

// Query shortcuts
const searchShortcuts = KbdModule.query({
  category: "search",
  enabled: true,
});

// Enable/disable shortcuts
KbdModule.enable("unique-id");
KbdModule.disable("unique-id");
```

### Platform-Specific Keys

Shortcuts automatically adapt to the user's platform:

```tsx
KbdModule.register({
  id: "save",
  name: "Save",
  keys: {
    mac: ["command", "S"],
    windows: ["ctrl", "S"],
    linux: ["ctrl", "S"],
    default: ["ctrl", "S"], // Fallback
  },
  callback: handleSave,
});

// The correct keys are automatically used based on the platform
```

### Alternative Keys

Support multiple key combinations for the same action:

```tsx
KbdModule.register({
  id: "search",
  name: "Search",
  keys: ["command", "K"],
  alternativeKeys: [
    ["command", "/"],
    ["ctrl", "F"],
  ],
  callback: openSearch,
});
```

### Categories and Contexts

Organize shortcuts by category and context:

```tsx
// Categories: navigation, editing, search, view, file, help, custom
// Contexts: global, editor, list, modal, form, custom

KbdModule.register({
  id: "save",
  category: "editing",
  context: "editor", // Only active in editor contexts
  keys: ["command", "S"],
  callback: handleSave,
});
```

### Priority System

Handle conflicts with priority levels:

```tsx
KbdModule.register({
  id: "important-action",
  keys: ["command", "K"],
  priority: "high", // low, normal, high, critical
  callback: handleAction,
});
```

## Hooks

### useShortcut

Register a single shortcut with automatic cleanup:

```tsx
import { useShortcut } from "@abdokouta/kbd";

function MyComponent() {
  useShortcut({
    id: "search.open",
    callback: () => openSearch(),
    enabled: true,
  });

  return <div>Component content</div>;
}
```

### useShortcuts

Register multiple shortcuts at once:

```tsx
import { useShortcuts } from "@abdokouta/kbd";

function MyComponent() {
  useShortcuts({
    shortcuts: [
      { id: "save", callback: handleSave },
      { id: "undo", callback: handleUndo },
      { id: "redo", callback: handleRedo },
    ],
  });

  return <div>Component content</div>;
}
```

### useShortcutRegistry

Access the registry in components:

```tsx
import { useShortcutRegistry } from "@abdokouta/kbd";

function ShortcutManager() {
  const registry = useShortcutRegistry();

  const handleToggle = (id: string) => {
    registry.toggle(id);
  };

  return (
    <div>
      {registry.getAll().map((shortcut) => (
        <div key={shortcut.id}>
          <span>{shortcut.name}</span>
          <button onClick={() => handleToggle(shortcut.id)}>
            {shortcut.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### useKeyboardShortcut

Low-level hook for custom shortcuts:

```tsx
import { useKeyboardShortcut } from "@abdokouta/kbd";

function MyComponent() {
  useKeyboardShortcut({
    keys: ["command", "K"],
    callback: () => console.log("Pressed!"),
    enabled: true,
    preventDefault: true,
  });

  return <div>Component content</div>;
}
```

## Components

### RefineKbd

Display keyboard shortcuts:

```tsx
import { RefineKbd } from "@abdokouta/kbd";

<RefineKbd keys={["command", "K"]} />
<RefineKbd keys={["ctrl", "shift", "P"]} separator=" + " />
<RefineKbd keys={["alt", "F4"]} variant="light" />
```

### ShortcutList

Display a list of shortcuts with filtering:

```tsx
import { ShortcutList } from "@abdokouta/kbd";

// Show all shortcuts
<ShortcutList />

// Filter by category
<ShortcutList category="navigation" />

// Group by category
<ShortcutList groupByCategory showSearch />

// Custom rendering
<ShortcutList
  renderItem={(shortcut) => (
    <div>
      <strong>{shortcut.name}</strong>
      <RefineKbd keys={shortcut.keys} />
    </div>
  )}
/>
```

### ShortcutHelp

Display a help modal with all shortcuts:

```tsx
import { ShortcutHelp } from "@abdokouta/kbd";

function App() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <button onClick={() => setHelpOpen(true)}>
        Show Shortcuts
      </button>
      <ShortcutHelp
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        groupByCategory
      />
    </>
  );
}

// Or use uncontrolled with auto shortcut registration
<ShortcutHelp registerShortcut />
```

## Configuration

Configure the KBD module:

```tsx
import { KbdModule } from "@abdokouta/kbd";

KbdModule.configure({
  // Register built-in shortcuts
  registerBuiltIn: true,

  // Enable debug logging
  debug: false,

  // Initial shortcuts
  shortcuts: [
    {
      id: "custom-action",
      name: "Custom Action",
      keys: ["command", "J"],
      callback: () => console.log("Custom!"),
    },
  ],

  // Default registration options
  defaultOptions: {
    skipConflictCheck: false,
  },
});
```

## TypeScript Support

Full TypeScript support with comprehensive types:

```tsx
import type {
  KeyboardShortcut,
  ShortcutCategory,
  ShortcutContext,
  Platform,
  ShortcutGroup,
} from "@abdokouta/kbd";

const shortcut: KeyboardShortcut = {
  id: "my-shortcut",
  name: "My Shortcut",
  category: "custom",
  context: "global",
  keys: ["command", "K"],
  callback: () => {},
};
```

## Examples

### Complete Application Setup

```tsx
import { KbdModule, ShortcutHelp } from "@abdokouta/kbd";

// Initialize in your app entry point
KbdModule.configure({
  registerBuiltIn: true,
  shortcuts: [
    {
      id: "app.search",
      name: "Search",
      category: "search",
      context: "global",
      keys: {
        mac: ["command", "K"],
        windows: ["ctrl", "K"],
        linux: ["ctrl", "K"],
      },
      callback: () => {
        // Open search
      },
    },
  ],
});

function App() {
  return (
    <div>
      <YourApp />
      <ShortcutHelp registerShortcut />
    </div>
  );
}
```

### Custom Shortcut Component

```tsx
import { useShortcut, RefineKbd } from "@abdokouta/kbd";

function SaveButton() {
  const [saved, setSaved] = useState(false);

  useShortcut({
    id: "editing.save",
    callback: () => {
      handleSave();
      setSaved(true);
    },
  });

  const handleSave = () => {
    // Save logic
  };

  return (
    <button onClick={handleSave}>
      Save <RefineKbd keys={["command", "S"]} />
      {saved && " ✓"}
    </button>
  );
}
```

## API Reference

See [API.md](./API.md) for complete API documentation.

## Built-in Shortcuts

See [SHORTCUTS.md](./SHORTCUTS.md) for a complete list of built-in shortcuts.

## License

MIT
