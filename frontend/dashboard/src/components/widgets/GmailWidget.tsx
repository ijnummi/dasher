import { useQuery } from '@tanstack/react-query'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

async function fetchUnread(): Promise<number | null> {
  const res = await fetch('/api/gmail/unread')
  if (res.status === 503) return null          // not configured
  if (!res.ok) throw new Error('Gmail API error')
  const data = await res.json()
  if (typeof data.unread !== 'number') {
    throw new Error(`Unexpected Gmail API response: ${JSON.stringify(data)}`)
  }
  return data.unread
}

function GmailWidget(_: WidgetProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gmail', 'unread'],
    queryFn: fetchUnread,
    refetchInterval: 60_000,
  })

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      {isLoading && <p className="text-[var(--widget-fg-muted)] text-sm">Loading…</p>}
      {isError   && <p className="text-red-500 dark:text-red-400 text-sm">Gmail error</p>}
      {data === null && <p className="text-[var(--widget-fg-dim)] text-sm">Gmail not configured</p>}
      {typeof data === 'number' && (
        <>
          <span className="text-4xl font-bold text-[var(--widget-fg)]">{data}</span>
          <span className="text-xs text-[var(--widget-fg-muted)]">unread messages</span>
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
