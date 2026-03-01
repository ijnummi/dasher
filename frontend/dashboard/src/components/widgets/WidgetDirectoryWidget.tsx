import { useQuery } from '@tanstack/react-query'
import { fetchWidgets } from '../../api/widgets'
import { resolveWidget } from '../../sdk'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

function WidgetDirectoryWidget(_: WidgetProps) {
  const { data: instances = [], isLoading, isError } = useQuery({
    queryKey: ['widget-instances'],
    queryFn: fetchWidgets,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--widget-fg-dim)] text-sm">
        Loading…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        Failed to load widgets.
      </div>
    )
  }

  return (
    <div className="h-full p-3 overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--widget-rule)]">
            <th className="text-left pb-1 pr-3 text-xs font-semibold uppercase tracking-wider text-[var(--widget-fg-muted)]">
              Name
            </th>
            <th className="text-left pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--widget-fg-muted)]">
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {instances.map((w) => {
            const def: WidgetDefinition | undefined = resolveWidget(w.widget_type)
            return (
              <tr key={w.id} className="border-t border-[var(--widget-rule)]">
                <td className="py-0.5 pr-3 text-[var(--widget-fg)] whitespace-nowrap">
                  {w.name || (
                    <span className="text-[var(--widget-fg-dim)] italic">unnamed</span>
                  )}
                </td>
                <td className="py-0.5 text-[var(--widget-fg-muted)] whitespace-nowrap">
                  {def?.label ?? (
                    <span className="font-mono text-xs">{w.widget_type}</span>
                  )}
                </td>
              </tr>
            )
          })}
          {instances.length === 0 && (
            <tr>
              <td colSpan={2} className="py-3 text-center text-[var(--widget-fg-dim)] text-xs">
                No widget instances found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export const definition: WidgetDefinition = {
  type: 'widget_directory',
  label: 'Widget Directory',
  description: 'Lists all widget instances on the dashboard with their names and types.',
  component: WidgetDirectoryWidget,
  defaultSize: { w: 4, h: 4 },
}

export default WidgetDirectoryWidget
