import { useQuery } from '@tanstack/react-query'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

interface QueueSlot {
  id: string
  filename: string
  status: string
  mb: string
  mbleft: string
  percentage: string
  timeleft: string
  cat: string
}

interface QueueData {
  configured: boolean
  slots: QueueSlot[]
  speed: string
  sizeleft: string
  timeleft: string
  noofslots: number
  paused: boolean
}

async function fetchQueue(): Promise<QueueData> {
  const res = await fetch('/api/sabnzbd/queue')
  if (!res.ok) throw new Error('SABnzbd API error')
  return res.json()
}

const STATUS_COLORS: Record<string, string> = {
  Downloading: 'text-emerald-400',
  Paused:      'text-amber-400',
  Queued:      'text-slate-400',
  Verifying:   'text-blue-400',
  Repairing:   'text-blue-400',
  Extracting:  'text-purple-400',
  Failed:      'text-red-400',
}

function statusColor(status: string) {
  return STATUS_COLORS[status] ?? 'text-[var(--widget-fg-muted)]'
}

function SABnzbdWidget(_: WidgetProps) {
  const { data, isLoading, isError } = useQuery<QueueData>({
    queryKey: ['sabnzbd', 'queue'],
    queryFn: fetchQueue,
    refetchInterval: 10_000,
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
        <p className="text-red-400 text-sm">SABnzbd error</p>
      </div>
    )
  }

  if (!data?.configured) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--widget-fg-dim)] text-sm">SABnzbd not configured</p>
      </div>
    )
  }

  const { slots, speed, sizeleft, timeleft, noofslots, paused } = data

  return (
    <div className="flex flex-col h-full px-3 py-2 gap-2">
      {/* Header: speed / overall status */}
      <div className="flex items-center justify-between text-xs text-[var(--widget-fg-muted)] shrink-0">
        <span>{paused ? <span className="text-amber-400">Paused</span> : speed || 'Idle'}</span>
        <span>{sizeleft}{sizeleft && timeleft ? ' · ' : ''}{timeleft}</span>
        {noofslots > 5 && <span>+{noofslots - 5} more</span>}
      </div>

      {/* Queue slots */}
      {slots.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-[var(--widget-fg-dim)] text-sm">Queue empty</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
          {slots.map((slot) => {
            const pct = Math.min(100, Math.max(0, parseFloat(slot.percentage) || 0))
            return (
              <li key={slot.id} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--widget-fg)] truncate flex-1 leading-tight">
                    {slot.filename}
                  </span>
                  <span className={`text-[10px] shrink-0 ${statusColor(slot.status)}`}>
                    {slot.status}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500/70 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export const definition: WidgetDefinition = {
  type: 'sabnzbd',
  label: 'SABnzbd Queue',
  description: 'Shows the first 5 items in the SABnzbd download queue.',
  component: SABnzbdWidget,
  defaultSize: { w: 3, h: 3 },
}

export default SABnzbdWidget
