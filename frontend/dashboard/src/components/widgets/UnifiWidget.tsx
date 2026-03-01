import { useQuery } from '@tanstack/react-query'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

interface Device {
  mac: string
  name: string
  ip: string | null
  is_wired: boolean
  online: boolean
}

interface DevicesData {
  configured: boolean
  devices: Device[]
}

async function fetchDevices(): Promise<DevicesData> {
  const res = await fetch('/api/unifi/devices')
  if (!res.ok) throw new Error('UniFi API error')
  return res.json()
}

function UnifiWidget(_: WidgetProps) {
  const { data, isLoading, isError } = useQuery<DevicesData>({
    queryKey: ['unifi', 'devices'],
    queryFn: fetchDevices,
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
        <p className="text-red-400 text-sm">UniFi error</p>
      </div>
    )
  }

  if (!data?.configured) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--widget-fg-dim)] text-sm">UniFi not configured</p>
      </div>
    )
  }

  const { devices } = data
  const onlineCount = devices.filter((d) => d.online).length

  return (
    <div className="flex flex-col h-full px-3 py-2 gap-2">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-[var(--widget-fg-muted)] shrink-0">
        <span>
          <span className="text-emerald-400 font-medium">{onlineCount}</span> online
        </span>
        <span>{devices.length} total</span>
      </div>

      {/* Device list */}
      {devices.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-[var(--widget-fg-dim)] text-sm">No devices</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1 flex-1 min-h-0 overflow-hidden">
          {devices.map((d) => (
            <li key={d.mac} className="flex items-center gap-2 min-w-0">
              {/* Online indicator dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  d.online ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span className="text-xs text-[var(--widget-fg)] truncate flex-1 leading-tight">
                {d.name}
              </span>
              {/* Wired / wireless icon */}
              <span
                className="text-[10px] text-[var(--widget-fg-dim)] shrink-0"
                title={d.is_wired ? 'Wired' : 'Wireless'}
              >
                {d.is_wired ? '⎆' : '⌾'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const definition: WidgetDefinition = {
  type: 'unifi',
  label: 'UniFi Devices',
  description: 'Shows currently connected clients on your UniFi network.',
  component: UnifiWidget,
  defaultSize: { w: 3, h: 4 },
}

export default UnifiWidget
