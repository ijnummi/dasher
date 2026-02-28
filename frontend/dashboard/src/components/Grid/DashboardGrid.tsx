import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { resolveWidget } from '../../sdk'
import type { WidgetInstance } from '../../sdk'

// Re-export so existing importers (api/widgets.ts) don't need updating yet
export type { WidgetInstance }

interface Props {
  widgets: WidgetInstance[]
  editMode: boolean
  onLayoutSave: (layout: Layout[]) => void
}

function renderWidget(w: WidgetInstance) {
  const def = resolveWidget(w.widget_type)
  if (!def) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg border border-slate-700 bg-slate-800/50 text-slate-500 text-sm">
        Unknown widget: {w.widget_type}
      </div>
    )
  }
  const config = { ...def.defaultConfig, ...w.config }
  return <def.component config={config} instanceId={w.id} />
}

export default function DashboardGrid({ widgets, editMode, onLayoutSave }: Props) {
  const layout: Layout[] = widgets.map((w) => ({
    i: w.id,
    x: w.grid_x,
    y: w.grid_y,
    w: w.grid_w,
    h: w.grid_h,
  }))

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={80}
      width={1200}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".drag-handle"
      onDragStop={(layout) => onLayoutSave(layout)}
      onResizeStop={(layout) => onLayoutSave(layout)}
    >
      {widgets.map((w) => (
        <div key={w.id} className="relative">
          {editMode && (
            <div className="drag-handle absolute top-1 left-1 right-1 h-5 cursor-grab rounded bg-slate-700/40 hover:bg-slate-600/60 transition-colors" />
          )}
          <div className={editMode ? 'pt-6 h-full' : 'h-full'}>
            {renderWidget(w)}
          </div>
        </div>
      ))}
    </GridLayout>
  )
}
