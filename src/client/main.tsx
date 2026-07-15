import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { UnauthorizedError } from './lib/authedFetch';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 401 means the token is invalid — authedFetch already redirects to
      // login, so retrying is pointless. Keep the default retry for everything else.
      retry: (failureCount, error) =>
        !(error instanceof UnauthorizedError) && failureCount < 3,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
