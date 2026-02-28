import type { WidgetInstance } from '../components/Grid/DashboardGrid'
import type { Layout } from 'react-grid-layout'

const BASE = '/api'

export async function fetchWidgets(): Promise<WidgetInstance[]> {
  const res = await fetch(`${BASE}/widgets/instances`)
  if (!res.ok) throw new Error('Failed to fetch widgets')
  const data = await res.json()
  return data.widgets
}

export async function saveLayout(layout: Layout[]): Promise<void> {
  await Promise.all(
    layout.map((item) =>
      fetch(`${BASE}/widgets/instances/${item.i}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid_x: item.x, grid_y: item.y, grid_w: item.w, grid_h: item.h }),
      })
    )
  )
}
