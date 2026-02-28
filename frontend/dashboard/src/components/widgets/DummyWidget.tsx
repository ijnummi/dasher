import type { WidgetDefinition, WidgetProps } from '../../sdk'

interface DummyConfig {
  nimi?: string
}

function DummyWidget({ config }: WidgetProps<DummyConfig>) {
  const name = config.nimi?.trim() || 'World'
  return (
    <div className="flex items-center justify-center h-full rounded-lg border border-slate-700 bg-slate-800/50">
      <p className="text-xl font-semibold text-slate-100">Hello {name}</p>
    </div>
  )
}

export const definition: WidgetDefinition<DummyConfig> = {
  type: 'dummy',
  label: 'Hello World',
  description: 'A simple greeting widget — useful for testing.',
  component: DummyWidget,
  defaultConfig: { nimi: 'World' },
  defaultSize: { w: 3, h: 2 },
  settingsSchema: {
    fields: [
      {
        type: 'text',
        key: 'nimi',
        label: 'Name',
        description: 'Who to greet',
        default: 'World',
        placeholder: 'World',
      },
    ],
  },
}

export default DummyWidget
