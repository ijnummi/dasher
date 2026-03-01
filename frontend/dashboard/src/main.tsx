import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import WidgetPreview from './WidgetPreview'

// SYNC: QueryClient config ↔ frontend/admin/src/lib/queryClient.ts
// staleTime and retry must stay identical in both apps.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
})

// ?widget=<type>  →  isolated widget preview (no backend required)
// otherwise       →  normal dashboard
const isPreview = new URLSearchParams(location.search).has('widget')
  || location.search === '?preview'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {isPreview ? <WidgetPreview /> : <App />}
    </QueryClientProvider>
  </StrictMode>,
)
