import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme';
import App from './App';
import './i18n';
import { queryClient } from './service/queryClient';

// Font imports via CSS @import (loaded before render)
import './styles/fonts.css';

// Enable MSW mocking in development when VITE_USE_MOCK=true
console.log(import.meta.env.VITE_USE_MOCK)
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    return;
  }
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    </QueryClientProvider>
  );
});
