import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Layout } from 'react-grid-layout'
import DashboardGrid from './components/Grid/DashboardGrid'
import { fetchWidgets, saveLayout, patchWidgetColor } from './api/widgets'
import { useColorOverrides } from './hooks/useColorOverrides'
import './components/widgets'  // registers all built-in widget types

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, () => setDark((v) => !v)]
}

function Toggle({
  label,
  checked,
  onChange,
  activeColor = 'bg-blue-500',
}: {
  label: ReactNode
  checked: boolean
  onChange: () => void
  activeColor?: string
}) {
  return (
    <>
      <span className="text-xs text-slate-500 dark:text-slate-400 select-none">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          checked ? activeColor : 'bg-slate-300 dark:bg-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </>
  )
}

export default function App() {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const [dark, toggleDark] = useDarkMode()
  const { overrides, setColor } = useColorOverrides()

  const { data: widgets = [], isLoading, isError } = useQuery({
    queryKey: ['widget-instances'],
    queryFn: fetchWidgets,
  })

  const layoutMutation = useMutation({
    mutationFn: saveLayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-instances'] }),
    onError: () => console.error('Failed to save layout'),
  })

  function handleLayoutSave(layout: Layout[]) {
    layoutMutation.mutate(layout)
  }

  function handleColorChange(id: string, color: string) {
    setColor(id, color)
    patchWidgetColor(id, color).catch((e) =>
      console.error('Failed to save widget color:', e)
    )
  }

  return (
    <div className="min-h-screen p-4 bg-slate-100 dark:bg-slate-950">
      {(editMode || devMode) && (
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dasher</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Dashboard</p>
        </header>
      )}

      {/* Floating toggles — top-right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1.5 shadow-lg border border-slate-200 dark:border-slate-700">
        <Toggle label="Edit" checked={editMode} onChange={() => setEditMode((v) => !v)} />
        <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
        <Toggle label="Dev" checked={devMode} onChange={() => setDevMode((v) => !v)} activeColor="bg-amber-500" />
        <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
        <Toggle label="☀" checked={!dark} onChange={toggleDark} activeColor="bg-yellow-400" />
      </div>

      <main>
        {isLoading && <p className="text-slate-500 dark:text-slate-400">Loading widgets…</p>}
        {isError && <p className="text-red-500 dark:text-red-400">Failed to load widgets.</p>}
        {layoutMutation.isError && <p className="text-red-500 dark:text-red-400 text-sm mt-2">Layout save failed.</p>}
        {!isLoading && !isError && (
          <DashboardGrid
            widgets={widgets}
            editMode={editMode}
            devMode={devMode}
            dark={dark}
            colorOverrides={overrides}
            onColorChange={handleColorChange}
            onLayoutSave={handleLayoutSave}
          />
        )}
      </main>
    </div>
  )
}
