import { Card } from '../components/Card'
import type { CardVariant } from '../components/Card'

// ── Helpers ────────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
      {children}
    </h2>
  )
}

function Label({ children }: { children: string }) {
  return (
    <p className="mt-2 text-center text-[11px] text-slate-600 font-mono">{children}</p>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ComponentsPage() {
  const variants: CardVariant[] = ['default', 'primary', 'success', 'warning', 'danger']

  return (
    <div className="space-y-12 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Components</h1>
        <p className="text-slate-400 text-sm">Live catalogue of UI primitives used across the admin app.</p>
      </div>

      {/* ── Card: Variants ──────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Card — Variants</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {variants.map((v) => (
            <div key={v}>
              <Card
                variant={v}
                title={v.charAt(0).toUpperCase() + v.slice(1)}
                description="Short description line."
              >
                Body content goes here.
              </Card>
              <Label>{v}</Label>
            </div>
          ))}
        </div>
      </section>

      {/* ── Card: With footer ───────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Card — With Footer</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Card title="Default + Footer" description="Subtext below the title.">
              Main content area.
            </Card>
            <Label>default + footer (text)</Label>
          </div>

          <div>
            <Card
              variant="primary"
              title="Primary + Footer"
              footer="Last updated just now"
            >
              Content section with a footer bar.
            </Card>
            <Label>primary + footer</Label>
          </div>

          <div>
            <Card
              variant="success"
              title="Success + Footer"
              description="All systems operational."
              footer={
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
              }
            >
              Service is running normally.
            </Card>
            <Label>success + footer (node)</Label>
          </div>
        </div>
      </section>

      {/* ── Card: With Icons ────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Card — With Icon</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Card variant="default" title="Widget Directory" description="All registered widgets." icon="📦">
              11 instances found.
            </Card>
            <Label>icon + default</Label>
          </div>
          <div>
            <Card variant="primary" title="RSS Feeds" description="Active feed sources." icon="📡">
              3 feeds configured.
            </Card>
            <Label>icon + primary</Label>
          </div>
          <div>
            <Card variant="warning" title="Rate Limit" description="API calls throttled." icon="⚠️">
              Retry in 30 seconds.
            </Card>
            <Label>icon + warning</Label>
          </div>
          <div>
            <Card variant="danger" title="Connection Lost" description="Backend unreachable." icon="🔴">
              Check your network.
            </Card>
            <Label>icon + danger</Label>
          </div>
        </div>
      </section>

      {/* ── Card: Header Only ───────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Card — Header Only</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {variants.map((v) => (
            <div key={v}>
              <Card variant={v} title={v.charAt(0).toUpperCase() + v.slice(1)} />
              <Label>header only</Label>
            </div>
          ))}
        </div>
      </section>

      {/* ── Card: Body Only ─────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Card — Body Only (no header)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {variants.map((v) => (
            <div key={v}>
              <Card variant={v}>
                Body without a title.
              </Card>
              <Label>body only</Label>
            </div>
          ))}
        </div>
      </section>

      {/* ── Card: Loading State ─────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Card — Loading State</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Card title="Fetching Data" loading />
            <Label>loading (default)</Label>
          </div>
          <div>
            <Card variant="primary" title="Connecting…" loading />
            <Label>loading (primary)</Label>
          </div>
          <div>
            <Card variant="warning" title="Retrying…" loading />
            <Label>loading (warning)</Label>
          </div>
        </div>
      </section>

      {/* ── Card: Compact (no padding override) ─────────────────────────────── */}
      <section>
        <SectionTitle>Card — Compact rows</SectionTitle>
        <div className="max-w-sm space-y-1.5">
          {(['Clock', 'RSS Feed', 'Gmail', 'Home Assistant', 'SABnzbd'] as const).map((label, i) => (
            <Card
              key={label}
              variant={i === 2 ? 'success' : i === 4 ? 'warning' : 'default'}
              title={label}
              footer={`Instance ${i + 1} · 2×2`}
            />
          ))}
        </div>
        <Label>stacked compact cards</Label>
      </section>
    </div>
  )
}
