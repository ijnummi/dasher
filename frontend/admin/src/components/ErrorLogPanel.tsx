import { useState } from 'react'
import { useAtom } from 'jotai'
import { errorLogAtom } from '../lib/errorLog'

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function ErrorLogPanel() {
  const [entries, setEntries] = useAtom(errorLogAtom)
  const [expanded, setExpanded] = useState(false)

  if (entries.length === 0) return null

  function dismiss(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function clearAll() {
    setEntries([])
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-red-900 bg-slate-950 text-sm shadow-xl">
      {/* Toggle bar */}
      <button
        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-slate-900 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="font-medium">
          ⚠ {entries.length} error{entries.length !== 1 ? 's' : ''}
        </span>
        <span className="ml-auto text-slate-500 text-xs">{expanded ? '▼ collapse' : '▲ expand'}</span>
        <button
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2"
          onClick={(e) => { e.stopPropagation(); clearAll() }}
        >
          clear all
        </button>
      </button>

      {/* Error list */}
      {expanded && (
        <ul className="max-h-56 overflow-y-auto border-t border-slate-800 divide-y divide-slate-800/60">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 px-4 py-2">
              <span className="text-slate-500 shrink-0 font-mono text-xs pt-0.5">
                {formatTime(entry.time)}
              </span>
              <span className="text-red-300 flex-1 break-all">{entry.message}</span>
              <button
                className="text-slate-600 hover:text-slate-300 transition-colors shrink-0 px-1"
                onClick={() => dismiss(entry.id)}
                title="Dismiss"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
