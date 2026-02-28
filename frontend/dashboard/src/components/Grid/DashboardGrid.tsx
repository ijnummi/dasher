import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import DummyWidget from '../widgets/DummyWidget'
import TechAboutWidget from '../widgets/TechAboutWidget'

export interface WidgetInstance {
  id: string
  widget_type: string
  config: Record<string, unknown>
  grid_x: number
  grid_y: number
  grid_w: number
  grid_h: number
}

interface Props {
  widgets: WidgetInstance[]
  onLayoutSave: (layout: Layout[]) => void
}

function renderWidget(w: WidgetInstance) {
  switch (w.widget_type) {
    case 'dummy':
      return <DummyWidget config={w.config as { nimi?: string }} />
    case 'tech_about':
      return <TechAboutWidget />
    default:
      return (
        <div className="flex items-center justify-center h-full rounded-lg border border-slate-700 bg-slate-800/50 text-slate-500 text-sm">
          Unknown widget: {w.widget_type}
        </div>
      )
  }
}

export default function DashboardGrid({ widgets, onLayoutSave }: Props) {
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
      draggableHandle=".drag-handle"
      onDragStop={(layout) => onLayoutSave(layout)}
      onResizeStop={(layout) => onLayoutSave(layout)}
    >
      {widgets.map((w) => (
        <div key={w.id} className="relative">
          <div className="drag-handle absolute top-1 left-1 right-1 h-5 cursor-grab rounded bg-slate-700/40 hover:bg-slate-600/60 transition-colors" />
          <div className="pt-6 h-full">
            {renderWidget(w)}
          </div>
        </div>
      ))}
    </GridLayout>
  )
}
