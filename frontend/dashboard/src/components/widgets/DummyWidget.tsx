interface Props {
  config: { nimi?: string }
}

export default function DummyWidget({ config }: Props) {
  const name = config.nimi?.trim() || 'World'
  return (
    <div className="flex items-center justify-center h-full rounded-lg border border-slate-700 bg-slate-800/50">
      <p className="text-xl font-semibold text-slate-100">Hello {name}</p>
    </div>
  )
}
