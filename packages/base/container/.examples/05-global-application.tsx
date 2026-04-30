/**
 * Example: Using Global Application Pattern
 *
 * This example shows the new recommended pattern where Application.create()
 * automatically registers the app globally, and ContainerProvider uses it
 * without needing a context prop.
 *
 * ## Benefits:
 * - ✅ Cleaner code (no prop drilling)
 * - ✅ Single source of truth
 * - ✅ Easier testing
 * - ✅ Better DX
 *
 * NOTE: This is a conceptual example with pseudo-code.
 * Some imports are placeholders to demonstrate the pattern.
 */

// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Application,
  Module,
  Injectable,
  ContainerProvider,
  useInject,
} from '@stackra/ts-container';

// ============================================================================
// Services
// ============================================================================

@Injectable()
class ConfigService {
  getApiUrl() {
    return 'https://api.example.com';
  }
}

@Injectable()
class UserService {
  constructor(private config: ConfigService) {}

  getUsers() {
    console.log('Fetching from:', this.config.getApiUrl());
    return ['Alice', 'Bob', 'Charlie'];
  }
}

// ============================================================================
// Modules
// ============================================================================

@Module({
  providers: [ConfigService, UserService],
  exports: [UserService],
})
class AppModule {}

// ============================================================================
// React Components
// ============================================================================

function UserList() {
  // Inject services using hooks
  const userService = useInject(UserService);
  const users = userService.getUsers();

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>My App</h1>
      <UserList />
    </div>
  );
}

// ============================================================================
// Bootstrap (NEW PATTERN - Recommended)
// ============================================================================

async function bootstrapNew() {
  console.log('=== New Pattern (Global Application) ===\n');

  // Step 1: Create the application (automatically registers globally)
  await Application.create(AppModule);

  // Step 2: Render with ContainerProvider (no context prop needed!)
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ContainerProvider>
        <App />
      </ContainerProvider>
    </React.StrictMode>
  );

  console.log('✓ App bootstrapped with global application');
}

// ============================================================================
// Bootstrap (OLD PATTERN - Still Supported)
// ============================================================================

async function bootstrapOld() {
  console.log('=== Old Pattern (Explicit Context) ===\n');

  // Step 1: Create the application
  const app = await Application.create(AppModule);

  // Step 2: Render with ContainerProvider (explicit context prop)
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ContainerProvider context={app}>
        <App />
      </ContainerProvider>
    </React.StrictMode>
  );

  console.log('✓ App bootstrapped with explicit context');
}

// ============================================================================
// main.ts Example (Recommended)
// ============================================================================

/**
 * This is how your main.ts should look:
 */

// main.ts
import { AppModule } from './app.module';

// Create the application (registers globally)
await Application.create(AppModule, {
  debug: true,
  onReady: (app) => {
    console.log('Application ready!');
    console.log('Providers:', app.getContainer().getModules().size);
  },
});

// App.tsx
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContainerProvider>
      <App />
    </ContainerProvider>
  </React.StrictMode>
);

// ============================================================================
// Testing with Global Application
// ============================================================================

import { clearGlobalApplication, hasGlobalApplication } from '@stackra/ts-container';

describe('UserService', () => {
  beforeEach(async () => {
    // Clear any existing global application
    clearGlobalApplication();

    // Create a fresh application for testing
    await Application.create(AppModule);
  });

  afterEach(() => {
    // Clean up after each test
    clearGlobalApplication();
  });

  it('should fetch users', () => {
    // ContainerProvider will use the global application
    const { getByText } = render(
      <ContainerProvider>
        <UserList />
      </ContainerProvider>
    );

    expect(getByText('Alice')).toBeInTheDocument();
  });

  it('should check if global application exists', () => {
    expect(hasGlobalApplication()).toBe(true);

    clearGlobalApplication();

    expect(hasGlobalApplication()).toBe(false);
  });
});

// ============================================================================
// Multiple Applications (Advanced)
// ============================================================================

/**
 * If you need multiple applications (e.g., for micro-frontends),
 * you can still use explicit context:
 */

async function multipleApplications() {
  // Create separate applications
  const app1 = await Application.create(AppModule1);
  const app2 = await Application.create(AppModule2);

  // Use explicit context for each
  ReactDOM.createRoot(document.getElementById('app1')!).render(
    <ContainerProvider context={app1}>
      <App1 />
    </ContainerProvider>
  );

  ReactDOM.createRoot(document.getElementById('app2')!).render(
    <ContainerProvider context={app2}>
      <App2 />
    </ContainerProvider>
  );
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * If you forget to call Application.create(), you'll get a helpful error:
 */

function forgotToCreateApp() {
  try {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <ContainerProvider>
        <App />
      </ContainerProvider>
    );
  } catch (error) {
    console.error(error);
    // Error: ContainerProvider: No container context found.
    // Either pass a context prop or call Application.create() before rendering.
    //
    // Example:
    //   await Application.create(AppModule);
    //   <ContainerProvider><App /></ContainerProvider>
  }
}

// ============================================================================
// Run Example
// ============================================================================

// Use the new pattern (recommended)
bootstrapNew();

// Or use the old pattern (still works)
// bootstrapOld();
