interface TechRow {
  name: string
  version: string
  role: string
}

const BACKEND: TechRow[] = [
  { name: 'Python',            version: '3.12',   role: 'Runtime' },
  { name: 'FastAPI',           version: '0.115+', role: 'Web framework' },
  { name: 'uvicorn',          version: '0.30+',  role: 'ASGI server' },
  { name: 'SQLAlchemy',        version: '2.x',    role: 'ORM (async)' },
  { name: 'aiosqlite',         version: '0.20+',  role: 'SQLite driver' },
  { name: 'pydantic-settings', version: '2.x',    role: 'Config / env vars' },
  { name: 'httpx',             version: '0.27+',  role: 'Async HTTP client' },
  { name: 'feedparser',        version: '6.x',    role: 'RSS parsing' },
  { name: 'BeautifulSoup4',    version: '4.12+',  role: 'Web scraping' },
  { name: 'APScheduler',       version: '3.10+',  role: 'Background jobs' },
]

const DASHBOARD: TechRow[] = [
  { name: 'React',             version: '18',     role: 'UI framework' },
  { name: 'Vite',              version: '5',      role: 'Build tool' },
  { name: 'react-grid-layout', version: '1.4+',   role: 'Drag & drop grid' },
  { name: 'TanStack Query',    version: '5',      role: 'Data fetching' },
  { name: 'Zustand',           version: '5',      role: 'State management' },
  { name: 'Tailwind CSS',      version: '4',      role: 'Styling' },
]

const ADMIN: TechRow[] = [
  { name: 'React',             version: '19',     role: 'UI framework' },
  { name: 'Vite',              version: '6',      role: 'Build tool' },
  { name: 'TanStack Router',   version: '1',      role: 'Routing' },
  { name: 'TanStack Query',    version: '5',      role: 'Data fetching' },
  { name: 'Jotai',             version: '2',      role: 'State management' },
  { name: 'Tailwind CSS',      version: '4',      role: 'Styling' },
]

function Section({ title, rows }: { title: string; rows: TechRow[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</h3>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-slate-700/50">
              <td className="py-0.5 pr-3 font-medium text-slate-200 whitespace-nowrap">{r.name}</td>
              <td className="py-0.5 pr-3 text-slate-400 tabular-nums whitespace-nowrap">{r.version}</td>
              <td className="py-0.5 text-slate-500">{r.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TechAboutWidget() {
  return (
    <div className="h-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 overflow-auto">
      <h2 className="text-sm font-bold text-slate-100 mb-3">Tech Stack</h2>
      <div className="flex gap-6 flex-wrap">
        <Section title="Backend" rows={BACKEND} />
        <Section title="Dashboard" rows={DASHBOARD} />
        <Section title="Admin" rows={ADMIN} />
      </div>
    </div>
  )
}
