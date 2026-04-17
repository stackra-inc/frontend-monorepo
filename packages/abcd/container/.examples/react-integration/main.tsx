/**
 * React entry point — bootstraps the DI container and renders the app.
 *
 * Shows the full flow:
 * 1. Create the Application (scans modules, resolves providers)
 * 2. Wrap the React tree with <ContainerProvider>
 * 3. Components use useInject / useOptionalInject / useContainer
 */

// @ts-ignore
import ReactDOM from 'react-dom/client';
import { Application, ContainerProvider } from '@abdokouta/ts-container';
import { AppModule } from './services';
import { App } from './components';

async function bootstrap() {
  // 1. Bootstrap the DI container
  const app = await Application.create(AppModule, {
    debug: true,
    onReady: () => console.log('DI container ready'),
  });

  // 2. Render React with the container
  const root = ReactDOM.createRoot(document.getElementById('root')!);

  root.render(
    <ContainerProvider context={app}>
      <App />
    </ContainerProvider>
  );

  // 3. Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.close();
  });
}

bootstrap().catch(console.error);
