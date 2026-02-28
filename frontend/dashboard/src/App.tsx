import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Layout } from 'react-grid-layout'
import DashboardGrid from './components/Grid/DashboardGrid'
import { fetchWidgets, saveLayout } from './api/widgets'

export default function App() {
  const queryClient = useQueryClient()

  const { data: widgets = [], isLoading, isError } = useQuery({
    queryKey: ['widgets'],
    queryFn: fetchWidgets,
  })

  const layoutMutation = useMutation({
    mutationFn: saveLayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widgets'] }),
    onError: () => console.error('Failed to save layout'),
  })

  function handleLayoutSave(layout: Layout[]) {
    layoutMutation.mutate(layout)
  }

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Dasher</h1>
        <p className="text-slate-400 text-sm">Dashboard</p>
      </header>
      <main>
        {isLoading && <p className="text-slate-500">Loading widgets…</p>}
        {isError && <p className="text-red-400">Failed to load widgets.</p>}
        {layoutMutation.isError && <p className="text-red-400 text-sm mt-2">Layout save failed.</p>}
        {!isLoading && !isError && (
          <DashboardGrid widgets={widgets} onLayoutSave={handleLayoutSave} />
        )}
      </main>
    </div>
  )
}
