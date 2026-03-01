import { useState, useEffect } from 'react'
import './components/widgets'  // registers all built-in widget types
import { resolveWidget, getAllDefinitions } from './sdk'
import { deterministicColor, getBgTheme } from './utils/widgetColor'

// Mirror the grid constants used in DashboardGrid
const COL_W = 100  // px per grid column (12 cols at ~1200px)
const ROW_H = 80   // px per row

const SIZE_VARIANTS = [
  { label: 'S', wAdd: 0, hAdd: 0 },
  { label: 'M', wAdd: 2, hAdd: 2 },
  { label: 'L', wAdd: 5, hAdd: 4 },
]

function useDark(): [boolean, () => void] {
  const [dark, setDark] = useState(
    () =>
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, () => setDark((v) => !v)]
}

/** Widget picker shown when no ?widget= param is present. */
function WidgetPicker() {
  const defs = getAllDefinitions()
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Widget Preview</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Select a widget to preview it at multiple sizes.
        Append <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">?widget=type</code> to the URL directly.
      </p>
      <ul className="flex flex-col gap-2">
        {defs.map((d) => (
          <li key={d.type}>
            <a
              href={`?widget=${d.type}`}
              className="inline-flex flex-col gap-0.5 px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <span className="font-medium text-slate-900 dark:text-slate-100">{d.label}</span>
              <span className="text-xs text-slate-500 font-mono">{d.type}</span>
              {d.description && (
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{d.description}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function WidgetPreview() {
  const widgetType = new URLSearchParams(location.search).get('widget') ?? ''
  const [dark, toggleDark] = useDark()

  const def = resolveWidget(widgetType)

  if (!widgetType || !def) {
    return <WidgetPicker />
  }

  const baseW = def.defaultSize?.w ?? 2
  const baseH = def.defaultSize?.h ?? 2
  const instanceId = `preview-${widgetType}`
  const config = (def.defaultConfig ?? {}) as Record<string, unknown>
  const bgColor = deterministicColor(instanceId, dark)
  const theme = getBgTheme(bgColor)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href="?"
          className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          ← all widgets
        </a>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{def.label}</h1>
        <code className="text-xs text-slate-400 font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          {widgetType}
        </code>
        {def.description && (
          <span className="text-sm text-slate-500 dark:text-slate-400">{def.description}</span>
        )}
        <button
          onClick={toggleDark}
          title="Toggle dark mode"
          className="ml-auto px-3 py-1 rounded-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-colors text-slate-700 dark:text-slate-300"
        >
          {dark ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Size previews */}
      <div className="flex flex-wrap gap-10 items-start">
        {SIZE_VARIANTS.map(({ label, wAdd, hAdd }) => {
          const w = baseW + wAdd
          const h = baseH + hAdd
          const pxW = w * COL_W
          const pxH = h * ROW_H
          return (
            <div key={label} className="flex flex-col gap-2 shrink-0">
              <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {label} &nbsp;{w}×{h} &nbsp;{pxW}×{pxH}px
              </div>
              <div
                data-widget-theme={theme}
                className="rounded-lg border border-slate-300/60 dark:border-slate-700/60 overflow-hidden"
                style={{ width: pxW, height: pxH, backgroundColor: bgColor }}
              >
                <def.component config={config} instanceId={instanceId} name="" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
