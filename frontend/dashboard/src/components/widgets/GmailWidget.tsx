import { useQuery } from '@tanstack/react-query'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

interface GmailMessage {
  id: string
  subject: string
  from: string
  date: string
  unread: boolean
}

interface InboxData {
  configured: boolean
  messages: GmailMessage[]
}

async function fetchInbox(): Promise<InboxData> {
  const res = await fetch('/api/gmail/inbox')
  if (!res.ok) throw new Error('Gmail API error')
  return res.json()
}

/** "John Doe <john@example.com>" → "John Doe", bare address stays as-is */
function senderName(from: string): string {
  const match = from.match(/^([^<]+?)\s*</)
  return match ? match[1].trim() : from
}

/** RFC 2822 date → short relative label */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const diffMs = Date.now() - d.getTime()
    const diffDays = Math.floor(diffMs / 86_400_000)
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7)   return d.toLocaleDateString([], { weekday: 'short' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function GmailWidget(_: WidgetProps) {
  const { data, isLoading, isError } = useQuery<InboxData>({
    queryKey: ['gmail', 'inbox'],
    queryFn: fetchInbox,
    refetchInterval: 60_000,
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
        <p className="text-red-400 text-sm">Gmail error</p>
      </div>
    )
  }

  if (!data?.configured) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--widget-fg-dim)] text-sm">Gmail not configured</p>
      </div>
    )
  }

  const { messages } = data

  return (
    <div className="flex flex-col h-full px-3 py-2 gap-1.5">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-[var(--widget-fg-dim)] text-sm">Inbox empty</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
          {messages.map((msg) => (
            <li key={msg.id} className="flex flex-col gap-0 min-w-0">
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                <span className={`text-xs truncate flex-1 leading-tight ${msg.unread ? 'font-semibold text-[var(--widget-fg)]' : 'text-[var(--widget-fg-muted)]'}`}>
                  {senderName(msg.from)}
                </span>
                <span className="text-[10px] shrink-0 text-[var(--widget-fg-dim)]">
                  {formatDate(msg.date)}
                </span>
              </div>
              <span className={`text-xs truncate leading-tight ${msg.unread ? 'font-semibold text-[var(--widget-fg)]' : 'text-[var(--widget-fg-dim)]'}`}>
                {msg.subject}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const definition: WidgetDefinition = {
  type: 'gmail',
  label: 'Gmail Inbox',
  description: 'Shows the five latest messages in your Gmail inbox.',
  component: GmailWidget,
  defaultSize: { w: 3, h: 3 },
}

export default GmailWidget
