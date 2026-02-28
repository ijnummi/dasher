import { useRef, useState, useEffect } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { resolveWidget } from '../../sdk'
import type { WidgetInstance } from '../../sdk'
import { resolveWidgetColor, randomWidgetColor, getBgTheme } from '../../utils/widgetColor'

// Re-export so existing importers (api/widgets.ts) don't need updating yet
export type { WidgetInstance }

interface Props {
  widgets: WidgetInstance[]
  editMode: boolean
  devMode: boolean
  dark: boolean
  colorOverrides: Record<string, string>
  onColorChange: (id: string, color: string) => void
  onLayoutSave: (layout: Layout[]) => void
}

function renderWidget(w: WidgetInstance) {
  const def = resolveWidget(w.widget_type)
  if (!def) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--widget-fg-dim)] text-sm">
        Unknown widget: {w.widget_type}
      </div>
    )
  }
  const config = { ...def.defaultConfig, ...w.config }
  return <def.component config={config} instanceId={w.id} />
}

export default function DashboardGrid({
  widgets, editMode, devMode, dark, colorOverrides, onColorChange, onLayoutSave,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1200)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout: Layout[] = widgets.map((w) => ({
    i: w.id,
    x: w.grid_x,
    y: w.grid_y,
    w: w.grid_w,
    h: w.grid_h,
  }))

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={containerWidth}
        isDraggable={editMode}
        isResizable={editMode}
        draggableHandle=".drag-handle"
        onDragStop={(layout) => onLayoutSave(layout)}
        onResizeStop={(layout) => onLayoutSave(layout)}
      >
        {widgets.map((w) => {
          const def = resolveWidget(w.widget_type)
          const hasName = !!w.name

          const showNameBar    = !editMode && hasName
          const showDevBar     = !editMode && !hasName && devMode
          const hasTopBar      = editMode || showNameBar || showDevBar
          const showCornerLabel = !editMode && !hasName && !devMode

          const bgColor  = resolveWidgetColor(w.id, w.background_color, colorOverrides[w.id], dark)
          const bgTheme  = getBgTheme(bgColor)

          return (
            <div
              key={w.id}
              data-widget-theme={bgTheme}
              className="relative rounded-lg border border-slate-300/60 dark:border-slate-700/60 overflow-hidden"
              style={{ backgroundColor: bgColor }}
            >
              {/* Named bar (non-edit) — type label in dev mode adds swatch */}
              {showNameBar && (
                <div className="absolute top-0 left-0 right-0 h-6 px-2 flex items-center gap-1.5">
                  <span className="text-xs text-[var(--widget-fg-dim)] truncate flex-1 pointer-events-none">
                    {w.name}
                  </span>
                  {devMode && (
                    <ColorSwatch
                      color={bgColor}
                      onClick={() => onColorChange(w.id, randomWidgetColor(dark))}
                    />
                  )}
                </div>
              )}

              {/* Dev bar — type key + swatch */}
              {showDevBar && (
                <div className="absolute top-0 left-0 right-0 h-6 px-2 flex items-center gap-1.5">
                  <span className="text-xs text-[var(--widget-amber)] font-mono truncate flex-1 pointer-events-none">
                    {w.widget_type}
                  </span>
                  <ColorSwatch
                    color={bgColor}
                    onClick={() => onColorChange(w.id, randomWidgetColor(dark))}
                  />
                </div>
              )}

              {/* Edit mode drag handle */}
              {editMode && (
                <div className="drag-handle absolute top-1 left-1 right-1 h-5 cursor-grab rounded bg-slate-200/60 dark:bg-slate-700/40 hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition-colors flex items-center justify-center">
                  {w.name && (
                    <span className="text-xs text-[var(--widget-fg-muted)] truncate px-1 pointer-events-none">
                      {w.name}
                    </span>
                  )}
                </div>
              )}

              {/* Corner ghost label — sits on the page bg, not the widget bg */}
              {showCornerLabel && (
                <span className="absolute top-0 left-2 text-[10px] leading-none text-slate-500 dark:text-slate-400 pointer-events-none -translate-y-1/2 bg-slate-100 dark:bg-slate-950 px-1">
                  {def?.label ?? w.widget_type}
                </span>
              )}

              <div className={hasTopBar ? 'pt-6 h-full' : 'h-full'}>
                {renderWidget(w)}
              </div>
            </div>
          )
        })}
      </GridLayout>
    </div>
  )
}

function ColorSwatch({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <button
      title="Randomize color"
      onClick={onClick}
      className="w-3.5 h-3.5 shrink-0 rounded-full border border-black/20 dark:border-white/20 hover:scale-125 transition-transform cursor-pointer"
      style={{ backgroundColor: color }}
    />
  )
}
