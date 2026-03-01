import { useQuery } from '@tanstack/react-query'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

interface HassConfig {
  entity_id: string
  label?: string
}

interface StateData {
  configured: boolean
  state: string | null
  attributes: {
    unit_of_measurement?: string
    friendly_name?: string
    [key: string]: unknown
  }
  error?: string
}

async function fetchState(entityId: string): Promise<StateData> {
  const res = await fetch(`/api/hass/state/${entityId}`)
  if (!res.ok) throw new Error('Home Assistant error')
  return res.json()
}

/** Round a numeric string to at most one decimal place. */
function formatValue(state: string): string {
  const n = parseFloat(state)
  if (isNaN(n)) return state
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function HassWidget({ config }: WidgetProps<HassConfig>) {
  const entityId = config.entity_id || 'sensor.total_power'

  const { data, isLoading, isError } = useQuery<StateData>({
    queryKey: ['hass', 'state', entityId],
    queryFn: () => fetchState(entityId),
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--widget-fg-muted)] text-sm">Loading…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-sm">Home Assistant error</p>
      </div>
    )
  }

  if (!data?.configured) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--widget-fg-dim)] text-sm">HASS not configured</p>
      </div>
    )
  }

  if (data.error || data.state === null) {
    return (
      <div className="flex items-center justify-center h-full px-3 text-center">
        <p className="text-[var(--widget-fg-dim)] text-sm">{data.error ?? 'Unknown entity'}</p>
      </div>
    )
  }

  const unit   = data.attributes.unit_of_measurement ?? ''
  const label  = config.label ?? data.attributes.friendly_name ?? entityId
  const value  = formatValue(data.state)

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1 px-3">
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tabular-nums text-[var(--widget-fg)]">
          {value}
        </span>
        {unit && (
          <span className="text-lg text-[var(--widget-fg-muted)]">{unit}</span>
        )}
      </div>
      <span className="text-xs text-[var(--widget-fg-dim)] truncate max-w-full text-center">
        {label}
      </span>
    </div>
  )
}

export const definition: WidgetDefinition<HassConfig> = {
  type: 'hass',
  label: 'HASS Sensor',
  description: 'Shows the current state of a Home Assistant entity.',
  component: HassWidget,
  defaultConfig: { entity_id: 'sensor.total_power' },
  defaultSize: { w: 2, h: 2 },
}

export default HassWidget
