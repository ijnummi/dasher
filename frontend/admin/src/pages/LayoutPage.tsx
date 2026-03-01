import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchInstances, fetchTypes, patchWidgetColor, patchWidgetName } from '../api/widgets'
import type { WidgetInstance } from '../api/widgets'
import { WidgetEditModal } from '../components/WidgetEditModal'

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generateComplementaryColors(count: number): string[] {
  if (count === 0) return []
  const baseHue = Math.random() * 360
  const saturation = 55 + Math.random() * 15  // 55–70 %
  const lightness = 22 + Math.random() * 10   // 22–32 % — dark but visible
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + (360 / count) * i) % 360
    return hslToHex(hue, saturation, lightness)
  })
}

function NameCell({ widget }: { widget: WidgetInstance }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(widget.name)

  const mutation = useMutation({
    mutationFn: (name: string) => patchWidgetName(widget.id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-instances'] }),
    onError: (e) => console.error('Failed to save name:', e),
  })

  function commit() {
    setEditing(false)
    if (value !== widget.name) mutation.mutate(value)
  }

  if (editing) {
    return (
      <input
        autoFocus
        className="bg-slate-800 text-slate-100 rounded px-1 py-0.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setValue(widget.name); setEditing(false) }
        }}
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-left w-full hover:text-blue-400 transition-colors"
      title="Click to edit name"
    >
      {widget.name || <span className="text-slate-600 italic">unnamed</span>}
      {mutation.isPending && <span className="ml-2 text-slate-500 text-xs">saving…</span>}
    </button>
  )
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-block rounded px-1.5 py-0.5 text-xs font-mono bg-slate-700 text-slate-300">
      {type}
    </span>
  )
}

function ColorCell({ widget }: { widget: WidgetInstance }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (color: string | null) => patchWidgetColor(widget.id, color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-instances'] }),
    onError: (e) => console.error('Failed to save color:', e),
  })

  const current = widget.background_color

  return (
    <div className="flex items-center gap-2">
      {/* Swatch wraps a hidden <input type="color"> */}
      <label
        title={current ?? 'No color set — click to pick'}
        className="relative cursor-pointer"
      >
        <span
          className="block w-5 h-5 rounded border border-slate-600"
          style={{ backgroundColor: current ?? 'transparent' }}
        >
          {!current && (
            <span className="flex items-center justify-center w-full h-full text-slate-500 text-[10px] font-mono leading-none select-none">
              —
            </span>
          )}
        </span>
        <input
          type="color"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          value={current ?? '#334155'}
          onChange={(e) => mutation.mutate(e.target.value)}
        />
      </label>

      {/* Show hex value when set */}
      {current && (
        <span className="font-mono text-xs text-slate-400">{current}</span>
      )}

      {/* Clear button — reverts to automatic/deterministic color */}
      {current && (
        <button
          onClick={() => mutation.mutate(null)}
          title="Reset to automatic color"
          className="text-slate-600 hover:text-slate-300 text-xs leading-none transition-colors"
        >
          ✕
        </button>
      )}

      {mutation.isPending && (
        <span className="text-slate-500 text-xs">saving…</span>
      )}
    </div>
  )
}

export default function LayoutPage() {
  const queryClient = useQueryClient()
  const instances = useQuery({ queryKey: ['widget-instances'], queryFn: fetchInstances })
  const types = useQuery({ queryKey: ['widget-types'], queryFn: fetchTypes })
  const [editing, setEditing] = useState<WidgetInstance | null>(null)

  const randomizeColors = useMutation({
    mutationFn: async (widgets: WidgetInstance[]) => {
      const colors = generateComplementaryColors(widgets.length)
      await Promise.all(widgets.map((w, i) => patchWidgetColor(w.id, colors[i])))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-instances'] }),
    onError: (e) => console.error('Failed to randomize colors:', e),
  })

  return (
    <div className="space-y-8">
      <WidgetEditModal widget={editing} onClose={() => setEditing(null)} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Layout</h1>
          <p className="text-slate-400 text-sm">Widget instances currently on the dashboard.</p>
        </div>
        <button
          onClick={() => instances.data?.length && randomizeColors.mutate(instances.data)}
          disabled={randomizeColors.isPending || !instances.data?.length}
          title="Assign random complementary colors to all widgets"
          className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-slate-100 transition-colors"
        >
          {randomizeColors.isPending ? 'Applying…' : '🎨 Randomize colors'}
        </button>
      </div>

      {/* Widget instances table */}
      <section>
        {instances.isLoading && <p className="text-slate-500 text-sm">Loading…</p>}
        {instances.isError && <p className="text-red-400 text-sm">Failed to load instances.</p>}
        {instances.data && (
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="text-left px-4 py-2 text-slate-400 font-medium">Name</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-medium">Type</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-medium">Position</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-medium">Size</th>
                  <th className="text-left px-4 py-2 text-slate-400 font-medium">Color</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {instances.data.map((w, i) => (
                  <tr
                    key={w.id}
                    className={i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/50'}
                  >
                    <td className="px-4 py-2 text-slate-100">
                      <NameCell widget={w} />
                    </td>
                    <td className="px-4 py-2">
                      <TypeBadge type={w.widget_type} />
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-400 text-xs">
                      {w.grid_x},{w.grid_y}
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-400 text-xs">
                      {w.grid_w}×{w.grid_h}
                    </td>
                    <td className="px-4 py-2">
                      <ColorCell widget={w} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => setEditing(w)}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-100 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {instances.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-600 text-sm">
                      No widget instances found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Available types */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Registered types
        </h2>
        {types.isLoading && <p className="text-slate-500 text-sm">Loading…</p>}
        {types.isError && <p className="text-red-400 text-sm">Failed to load types.</p>}
        {types.data && (
          <div className="flex flex-wrap gap-2">
            {types.data.map((t) => <TypeBadge key={t} type={t} />)}
          </div>
        )}
      </section>
    </div>
  )
}
