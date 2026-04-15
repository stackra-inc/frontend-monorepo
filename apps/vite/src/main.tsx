/**
 * Application Entry Point
 *
 * |--------------------------------------------------------------------------
 * | Bootstraps the DI container and renders the React app.
 * |--------------------------------------------------------------------------
 * |
 * | Order:
 * |   1. Capture PWA beforeinstallprompt event (fires before React mounts)
 * |   2. Bootstrap DI container (ApplicationContext)
 * |   3. Detect Electron environment
 * |   4. Render React app with ContainerProvider
 * |
 * @module main
 */

import 'reflect-metadata';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { bootstrapApp } from '@abdokouta/ts-application';
import { ContainerProvider } from '@abdokouta/ts-container-react';

import { Provider } from './provider';
import App from './App';

import { AppModule } from '@/lib/app.module';
import '@/styles/globals.css';

/*
|--------------------------------------------------------------------------
| PWA: Capture beforeinstallprompt early
|--------------------------------------------------------------------------
|
| The browser fires this event once during page load — often before
| React mounts. Stash it on window so PwaProvider can pick it up.
|
*/
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__PWA_DEFERRED_PROMPT__ = e;
});

/**
 * Bootstrap the DI container, then render the React app.
 */
async function bootstrap() {
  const app = await bootstrapApp(AppModule);

  /*
  |--------------------------------------------------------------------------
  | Electron: add CSS class for traffic light padding and drag region.
  |--------------------------------------------------------------------------
  */
  if ((window as any).electronAPI) {
    document.body.classList.add('is-electron');
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <ContainerProvider context={app}>
        <Provider>
          <App />
        </Provider>
      </ContainerProvider>
    </BrowserRouter>
  );
}

bootstrap().catch(console.error);
