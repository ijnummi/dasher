import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Layout } from 'react-grid-layout'
import DashboardGrid from './components/Grid/DashboardGrid'
import { fetchWidgets, saveLayout } from './api/widgets'
import './components/widgets'  // registers all built-in widget types

export default function App() {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)

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

      {/* Floating edit-mode toggle — top-right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-slate-800/90 backdrop-blur px-3 py-1.5 shadow-lg border border-slate-700">
        <span className="text-xs text-slate-400 select-none">Edit</span>
        <button
          role="switch"
          aria-checked={editMode}
          onClick={() => setEditMode((v) => !v)}
          className={[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
            'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            editMode ? 'bg-blue-500' : 'bg-slate-600',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200',
              editMode ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>

      <main>
        {isLoading && <p className="text-slate-500">Loading widgets…</p>}
        {isError && <p className="text-red-400">Failed to load widgets.</p>}
        {layoutMutation.isError && <p className="text-red-400 text-sm mt-2">Layout save failed.</p>}
        {!isLoading && !isError && (
          <DashboardGrid widgets={widgets} editMode={editMode} onLayoutSave={handleLayoutSave} />
        )}
      </main>
    </div>
  )
}
