import type { WidgetInstance } from '../components/Grid/DashboardGrid'
import type { Layout } from 'react-grid-layout'

const BASE = '/api'

export async function fetchWidgets(): Promise<WidgetInstance[]> {
  const res = await fetch(`${BASE}/widgets/instances`)
  if (!res.ok) throw new Error('Failed to fetch widgets')
  const data = await res.json()
  return data.widgets
}

export async function patchWidgetColor(id: string, color: string | null): Promise<void> {
  const res = await fetch(`${BASE}/widgets/instances/${id}/color`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ background_color: color }),
  })
  if (!res.ok) throw new Error(`Failed to update color for widget ${id}`)
}

export async function saveLayout(layout: Layout[]): Promise<void> {
  const results = await Promise.allSettled(
    layout.map((item) =>
      fetch(`${BASE}/widgets/instances/${item.i}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid_x: item.x, grid_y: item.y, grid_w: item.w, grid_h: item.h }),
      })
    )
  )
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      console.error(`Failed to save layout for widget ${layout[idx].i}:`, result.reason)
    }
  })
}
