import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patchWidgetName, patchWidgetColor } from '../api/widgets'
import type { WidgetInstance } from '../api/widgets'

interface Props {
  widget: WidgetInstance | null
  onClose: () => void
}

export function WidgetEditModal({ widget, onClose }: Props) {
  const queryClient = useQueryClient()
  const [name, setName]   = useState('')
  const [color, setColor] = useState('')

  // Sync draft state whenever the target widget changes
  useEffect(() => {
    if (widget) {
      setName(widget.name)
      setColor(widget.background_color ?? '')
    }
  }, [widget])

  const nameMutation = useMutation({
    mutationFn: (n: string) => patchWidgetName(widget!.id, n),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-instances'] }),
  })

  const colorMutation = useMutation({
    mutationFn: (c: string | null) => patchWidgetColor(widget!.id, c),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-instances'] }),
  })

  if (!widget) return null

  const isPending = nameMutation.isPending || colorMutation.isPending
  const isError   = nameMutation.isError   || colorMutation.isError

  async function handleSave() {
    if (!widget) return
    const ops: Promise<void>[] = []
    if (name !== widget.name)
      ops.push(nameMutation.mutateAsync(name))
    const newColor = color || null
    if (newColor !== widget.background_color)
      ops.push(colorMutation.mutateAsync(newColor))
    await Promise.all(ops)
    onClose()
  }

  function handleBackdropKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return createPortal(
    // Outer div captures Escape; also traps focus via autoFocus inside dialog
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleBackdropKey}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Edit Widget</h2>
            <span className="inline-block mt-1 rounded px-1.5 py-0.5 text-xs font-mono bg-slate-700 text-slate-300">
              {widget.widget_type}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            placeholder="Unnamed"
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-slate-600"
          />
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Background Color</label>
          <div className="flex items-center gap-3">
            {/* Swatch / native color picker */}
            <label className="relative cursor-pointer shrink-0" title={color || 'Pick a color'}>
              <span
                className="block w-8 h-8 rounded-lg border border-slate-600"
                style={{ backgroundColor: color || 'transparent' }}
              >
                {!color && (
                  <span className="flex items-center justify-center w-full h-full text-slate-500 text-xs select-none">
                    —
                  </span>
                )}
              </span>
              <input
                type="color"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                value={color || '#334155'}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>

            {/* Hex text input */}
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Automatic"
              maxLength={7}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-slate-600"
            />

            {/* Clear */}
            {color && (
              <button
                onClick={() => setColor('')}
                title="Reset to automatic"
                className="text-slate-500 hover:text-slate-300 transition-colors text-sm leading-none"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-slate-600">Leave empty to use the automatic deterministic color.</p>
        </div>

        {/* Error */}
        {isError && (
          <p className="text-red-400 text-xs">Failed to save changes — please try again.</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white rounded-lg transition-colors"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
