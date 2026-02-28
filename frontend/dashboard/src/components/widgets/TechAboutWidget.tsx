const { backend, dashboard, admin } = __VERSIONS__ ?? { backend: {}, dashboard: {}, admin: {} }

const DISPLAY_NAMES: Record<string, string> = {
  // backend
  'fastapi':           'FastAPI',
  'uvicorn':           'uvicorn',
  'sqlalchemy':        'SQLAlchemy',
  'aiosqlite':         'aiosqlite',
  'pydantic-settings': 'pydantic-settings',
  'httpx':             'httpx',
  'feedparser':        'feedparser',
  'beautifulsoup4':    'BeautifulSoup4',
  'apscheduler':       'APScheduler',
  // frontend
  'react':                  'React',
  'react-dom':              'react-dom',
  'react-grid-layout':      'react-grid-layout',
  '@tanstack/react-query':  'TanStack Query',
  '@tanstack/react-router': 'TanStack Router',
  'zustand':                'Zustand',
  'jotai':                  'Jotai',
  'tailwindcss':            'Tailwind CSS',
  'vite':                   'Vite',
}

const ROLES: Record<string, string> = {
  'fastapi':                'Web framework',
  'uvicorn':                'ASGI server',
  'sqlalchemy':             'ORM (async)',
  'aiosqlite':              'SQLite driver',
  'pydantic-settings':      'Config / env vars',
  'httpx':                  'Async HTTP client',
  'feedparser':             'RSS parsing',
  'beautifulsoup4':         'Web scraping',
  'apscheduler':            'Background jobs',
  'react':                  'UI framework',
  'react-dom':              'UI framework',
  'react-grid-layout':      'Drag & drop grid',
  '@tanstack/react-query':  'Data fetching',
  '@tanstack/react-router': 'Routing',
  'zustand':                'State management',
  'jotai':                  'State management',
  'tailwindcss':            'Styling',
  'vite':                   'Build tool',
}

function Section({ title, deps }: { title: string; deps: Record<string, string> }) {
  return (
    <div className="min-w-48">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</h3>
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(deps).map(([pkg, version]) => (
            <tr key={pkg} className="border-t border-slate-700/50">
              <td className="py-0.5 pr-3 font-medium text-slate-200 whitespace-nowrap">
                {DISPLAY_NAMES[pkg] ?? pkg}
              </td>
              <td className="py-0.5 pr-3 font-mono text-slate-400 whitespace-nowrap">{version}</td>
              <td className="py-0.5 text-slate-500 text-xs">{ROLES[pkg] ?? ''}</td>
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
        <Section title="Backend" deps={backend} />
        <Section title="Dashboard" deps={dashboard} />
        <Section title="Admin" deps={admin} />
      </div>
    </div>
  )
}
