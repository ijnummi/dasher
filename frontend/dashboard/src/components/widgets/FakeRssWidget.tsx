import { useState, useEffect } from 'react'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

const FAKE_ITEMS = [
  { source: 'BBC News',       title: 'Scientists discover new species of deep-sea fish near volcanic vent' },
  { source: 'Hacker News',    title: 'Show HN: I built a self-hosted dashboard in a weekend' },
  { source: 'Reuters',        title: 'Global markets steady as central banks signal rate pause' },
  { source: 'Ars Technica',   title: 'Rust 2.0 roadmap published; const generics finally stabilised' },
  { source: 'The Verge',      title: 'Apple quietly refreshes Mac mini with M4 Pro option' },
  { source: 'BBC News',       title: 'Record heatwave breaks 40-year-old temperature mark in southern Europe' },
  { source: 'NASA',           title: 'Webb telescope captures clearest image yet of a stellar nursery' },
  { source: 'Wired',          title: 'The quiet rise of local-first software — and why it matters' },
  { source: 'Reuters',        title: 'OPEC+ agrees to extend output cuts through Q3' },
  { source: 'Ars Technica',   title: 'Linux 6.9 ships with AMD Zen 5 scheduler improvements' },
  { source: 'The Guardian',   title: 'Ancient Roman mosaic unearthed beneath a car park in Turkey' },
  { source: 'Hacker News',    title: "Ask HN: What's your homelab setup in 2025?" },
  { source: 'TechCrunch',     title: 'Startup raises $40 M to bring solid-state batteries to EVs' },
  { source: 'Nature',         title: 'New study links gut microbiome diversity to reduced anxiety' },
  { source: 'The Verge',      title: 'Google releases Gemini 2.0 Flash with 1 M token context window' },
  { source: 'ESPN',           title: 'Finland wins ice hockey World Championship for third year running' },
  { source: 'Ars Technica',   title: 'Firefox 130 ships with experimental vertical tab strip' },
  { source: 'Reuters',        title: 'Eurozone inflation falls to 1.8%, below ECB 2% target' },
]

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function FakeRssWidget(_: WidgetProps) {
  const [items, setItems] = useState(() => pickRandom(FAKE_ITEMS, 5))

  // Re-roll on double-click so the widget feels "alive" in demos
  useEffect(() => {
    const el = document.currentScript  // unused, just a no-op anchor
    void el
  }, [])

  return (
    <div
      className="h-full p-2 overflow-hidden flex flex-col gap-0.5 cursor-pointer"
      onDoubleClick={() => setItems(pickRandom(FAKE_ITEMS, 5))}
      title="Double-click to refresh"
    >
      {items.map((item, i) => (
        <div key={i} className="flex items-baseline gap-2 min-w-0">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[var(--widget-fg-muted)] w-20 truncate">
            {item.source}
          </span>
          <span className="text-xs text-[var(--widget-fg)] truncate leading-5">
            {item.title}
          </span>
        </div>
      ))}
    </div>
  )
}

export const definition: WidgetDefinition = {
  type: 'rss',
  label: 'RSS Feed',
  description: 'Displays the latest RSS headlines (placeholder data).',
  component: FakeRssWidget,
  defaultSize: { w: 4, h: 2 },
}

export default FakeRssWidget
