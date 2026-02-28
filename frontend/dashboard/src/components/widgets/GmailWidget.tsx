import { useQuery } from '@tanstack/react-query'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

async function fetchUnread(): Promise<number | null> {
  const res = await fetch('/api/gmail/unread')
  if (res.status === 503) return null          // not configured
  if (!res.ok) throw new Error('Gmail API error')
  return (await res.json()).unread as number
}

function GmailWidget(_: WidgetProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gmail', 'unread'],
    queryFn: fetchUnread,
    refetchInterval: 60_000,
  })

  return (
    <div className="flex flex-col items-center justify-center h-full rounded-lg border border-slate-700 bg-slate-800/50 gap-1">
      {isLoading && <p className="text-slate-400 text-sm">Loading…</p>}
      {isError   && <p className="text-red-400 text-sm">Gmail error</p>}
      {data === null && <p className="text-slate-500 text-sm">Gmail not configured</p>}
      {typeof data === 'number' && (
        <>
          <span className="text-4xl font-bold text-slate-100">{data}</span>
          <span className="text-xs text-slate-400">unread messages</span>
        </>
      )}
    </div>
  )
}

// Gmail credentials live in server-side env vars, so there are no user-facing
// config fields. The settingsSchema is intentionally omitted.
export const definition: WidgetDefinition = {
  type: 'gmail',
  label: 'Gmail Unread',
  description: 'Shows the number of unread messages in your Gmail inbox.',
  component: GmailWidget,
  defaultSize: { w: 2, h: 2 },
}

export default GmailWidget
