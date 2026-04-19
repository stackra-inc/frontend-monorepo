# Built-in Keyboard Shortcuts

This document lists all built-in keyboard shortcuts provided by
`@stackra-inc/kbd`.

## Navigation Shortcuts

| ID                      | Name       | Description                   | macOS   | Windows/Linux  |
| ----------------------- | ---------- | ----------------------------- | ------- | -------------- |
| `navigation.go-back`    | Go Back    | Navigate to the previous page | `⌘ [`   | `Alt ←`        |
| `navigation.go-forward` | Go Forward | Navigate to the next page     | `⌘ ]`   | `Alt →`        |
| `navigation.go-home`    | Go Home    | Navigate to the home page     | `⌘ ⇧ H` | `Ctrl Shift H` |

## Search Shortcuts

| ID                    | Name         | Description                    | macOS | Windows/Linux | Alternative       |
| --------------------- | ------------ | ------------------------------ | ----- | ------------- | ----------------- |
| `search.open`         | Open Search  | Open the global search dialog  | `⌘ K` | `Ctrl K`      | `⌘ /` or `Ctrl /` |
| `search.find-in-page` | Find in Page | Search within the current page | `⌘ F` | `Ctrl F`      | -                 |

## Editing Shortcuts

| ID              | Name  | Description                       | macOS   | Windows/Linux | Alternative             |
| --------------- | ----- | --------------------------------- | ------- | ------------- | ----------------------- |
| `editing.save`  | Save  | Save the current document or form | `⌘ S`   | `Ctrl S`      | -                       |
| `editing.undo`  | Undo  | Undo the last action              | `⌘ Z`   | `Ctrl Z`      | -                       |
| `editing.redo`  | Redo  | Redo the last undone action       | `⌘ ⇧ Z` | `Ctrl Y`      | `⌘ Y` or `Ctrl Shift Z` |
| `editing.copy`  | Copy  | Copy selected content             | `⌘ C`   | `Ctrl C`      | -                       |
| `editing.paste` | Paste | Paste copied content              | `⌘ V`   | `Ctrl V`      | -                       |
| `editing.cut`   | Cut   | Cut selected content              | `⌘ X`   | `Ctrl X`      | -                       |

## View Shortcuts

| ID                       | Name              | Description                   | macOS   | Windows/Linux | Alternative       |
| ------------------------ | ----------------- | ----------------------------- | ------- | ------------- | ----------------- |
| `view.toggle-sidebar`    | Toggle Sidebar    | Show or hide the sidebar      | `⌘ B`   | `Ctrl B`      | -                 |
| `view.toggle-fullscreen` | Toggle Fullscreen | Enter or exit fullscreen mode | `⌘ ^ F` | `F11`         | -                 |
| `view.zoom-in`           | Zoom In           | Increase zoom level           | `⌘ +`   | `Ctrl +`      | `⌘ =` or `Ctrl =` |
| `view.zoom-out`          | Zoom Out          | Decrease zoom level           | `⌘ -`   | `Ctrl -`      | -                 |
| `view.reset-zoom`        | Reset Zoom        | Reset zoom to 100%            | `⌘ 0`   | `Ctrl 0`      | -                 |

## Help Shortcuts

| ID                    | Name                    | Description                              | macOS   | Windows/Linux | Alternative               |
| --------------------- | ----------------------- | ---------------------------------------- | ------- | ------------- | ------------------------- |
| `help.show-shortcuts` | Show Keyboard Shortcuts | Display all available keyboard shortcuts | `⌘ /`   | `Ctrl /`      | `⌘ ⇧ ?` or `Ctrl Shift ?` |
| `help.open`           | Open Help               | Open the help documentation              | `⌘ ⇧ H` | `F1`          | -                         |

## Modal/Dialog Shortcuts

| ID              | Name        | Description                       | Keys    |
| --------------- | ----------- | --------------------------------- | ------- |
| `modal.close`   | Close Modal | Close the current modal or dialog | `esc`   |
| `modal.confirm` | Confirm     | Confirm the current modal action  | `Enter` |

## Shortcut Groups

Built-in shortcuts are organized into the following groups:

### Navigation Group

- **ID**: `navigation`
- **Description**: Navigate through the application
- **Shortcuts**: 3 shortcuts (go-back, go-forward, go-home)

### Search Group

- **ID**: `search`
- **Description**: Search and find content
- **Shortcuts**: 2 shortcuts (open-search, find-in-page)

### Editing Group

- **ID**: `editing`
- **Description**: Edit and modify content
- **Shortcuts**: 6 shortcuts (save, undo, redo, copy, paste, cut)

### View Group

- **ID**: `view`
- **Description**: Control the view and layout
- **Shortcuts**: 5 shortcuts (toggle-sidebar, toggle-fullscreen, zoom-in,
  zoom-out, reset-zoom)

### Help Group

- **ID**: `help`
- **Description**: Get help and documentation
- **Shortcuts**: 2 shortcuts (show-shortcuts, open-help)

### Modals Group

- **ID**: `modals`
- **Description**: Interact with modals and dialogs
- **Shortcuts**: 2 shortcuts (close-modal, confirm-modal)

## Usage

### Registering Built-in Shortcuts

Built-in shortcuts are automatically registered when you configure the KBD
module:

```tsx
import { KbdModule } from '@stackra-inc/kbd';

KbdModule.configure({
  registerBuiltIn: true, // Enable built-in shortcuts
});
```

### Overriding Built-in Shortcuts

You can override built-in shortcuts by registering a shortcut with the same ID:

```tsx
import { KbdModule } from '@stackra-inc/kbd';

// Override the save shortcut
KbdModule.register({
  id: 'editing.save',
  name: 'Save',
  keys: ['command', 'S'],
  callback: () => {
    // Your custom save logic
    myCustomSave();
  },
});
```

### Disabling Built-in Shortcuts

You can disable specific built-in shortcuts:

```tsx
import { KbdModule } from '@stackra-inc/kbd';

// Disable the save shortcut
KbdModule.disable('editing.save');

// Or disable multiple shortcuts
['editing.save', 'editing.undo', 'editing.redo'].forEach((id) => {
  KbdModule.disable(id);
});
```

### Using Built-in Shortcuts in Components

```tsx
import { useShortcut } from '@stackra-inc/kbd';

function MyComponent() {
  // Use a built-in shortcut with custom callback
  useShortcut({
    id: 'editing.save',
    callback: () => {
      // Your save logic
      handleSave();
    },
  });

  return <div>Component content</div>;
}
```

### Importing Built-in Shortcuts

You can import the built-in shortcuts directly:

```tsx
import {
  BUILT_IN_SHORTCUTS,
  NAVIGATION_SHORTCUTS,
  SEARCH_SHORTCUTS,
  EDITING_SHORTCUTS,
  VIEW_SHORTCUTS,
  HELP_SHORTCUTS,
  MODAL_SHORTCUTS,
} from '@stackra-inc/kbd';

// Use them as needed
console.log('Total built-in shortcuts:', BUILT_IN_SHORTCUTS.length);
console.log('Navigation shortcuts:', NAVIGATION_SHORTCUTS);
```

## Categories

Shortcuts are organized into the following categories:

- **navigation**: Navigate through the application
- **editing**: Edit and modify content
- **search**: Search and find content
- **view**: Control the view and layout
- **file**: File operations (not used in built-in shortcuts)
- **help**: Get help and documentation
- **custom**: Custom shortcuts

## Contexts

Shortcuts can be scoped to specific contexts:

- **global**: Available everywhere in the application
- **editor**: Available in editor contexts
- **list**: Available in list/table contexts
- **modal**: Available in modal/dialog contexts
- **form**: Available in form contexts
- **custom**: Custom contexts

## Priority Levels

Some shortcuts have priority levels to handle conflicts:

- **low**: Low priority
- **normal**: Normal priority (default)
- **high**: High priority (used for important shortcuts like save, search)
- **critical**: Critical priority

## Platform Detection

The package automatically detects the user's platform and uses the appropriate
key combinations:

- **macOS**: Uses Command (⌘) key
- **Windows**: Uses Ctrl key
- **Linux**: Uses Ctrl key

## Icons

Built-in shortcuts include Lucide React icons:

- Navigation: `ArrowLeft`, `ArrowRight`, `Home`
- Search: `Search`, `FileSearch`
- Editing: `Save`, `Undo`, `Redo`, `Copy`, `Clipboard`, `Scissors`
- View: `PanelLeft`, `Maximize`, `ZoomIn`, `ZoomOut`, `RotateCcw`
- Help: `HelpCircle`, `BookOpen`
- Modals: `X`, `Check`

## Notes

- Some shortcuts (like copy, paste, cut, find-in-page, zoom) have
  `preventDefault: false` to allow the browser's default behavior
- Editing shortcuts (undo, redo, copy, paste, cut) have `allowInInput: true` to
  work inside input fields
- Modal shortcuts are scoped to the `modal` context
- Search and help shortcuts have `priority: "high"` to ensure they work even
  when other shortcuts are registered
