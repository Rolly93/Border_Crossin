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
if (import.meta.env.VITE_USE_MOCK === 'true') {
  if (typeof window !== 'undefined') {
    import('./mocks/browser').then(({ worker }) => {
      worker.start({
        onUnhandledRequest: 'bypass',
      });
      // console.log('[MSW] Mock Service Worker started');
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </QueryClientProvider>
);
