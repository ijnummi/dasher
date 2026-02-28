const BASE = '/api'

// SYNC: WidgetInstance ↔ frontend/dashboard/src/sdk/types.ts WidgetInstance
// Fields must stay identical. Extract to shared npm workspace package when added.
export interface WidgetInstance {
  id: string
  widget_type: string
  name: string
  config: Record<string, unknown>
  grid_x: number
  grid_y: number
  grid_w: number
  grid_h: number
  background_color: string | null
}

// SYNC: fetchInstances ↔ frontend/dashboard/src/api/widgets.ts fetchWidgets
// Same endpoint, same response shape. Keep error messages and return value identical.
export async function fetchInstances(): Promise<WidgetInstance[]> {
  const res = await fetch(`${BASE}/widgets/instances`)
  if (!res.ok) throw new Error('Failed to fetch widget instances')
  return (await res.json()).widgets
}

// SYNC: patchWidgetColor ↔ frontend/dashboard/src/api/widgets.ts patchWidgetColor (byte-for-byte identical)
export async function patchWidgetColor(id: string, color: string | null): Promise<void> {
  const res = await fetch(`${BASE}/widgets/instances/${id}/color`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ background_color: color }),
  })
  if (!res.ok) throw new Error(`Failed to update color for widget ${id}`)
}

export async function fetchTypes(): Promise<string[]> {
  const res = await fetch(`${BASE}/widgets/types`)
  if (!res.ok) throw new Error('Failed to fetch widget types')
  return (await res.json()).types
}
