import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { devModeAtom } from './lib/devMode'
import LayoutPage from './pages/LayoutPage'
import ComponentsPage from './pages/ComponentsPage'
import ErrorLogPanel from './components/ErrorLogPanel'

// ── Root layout ────────────────────────────────────────────────────────────────

function NavLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="text-slate-400 hover:text-slate-100 transition-colors [&.active]:text-white"
    >
      {children}
    </Link>
  )
}

function RootLayout() {
  const [dev, setDev] = useAtom(devModeAtom)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-bold text-slate-100 mr-2">Dasher Admin</span>

        <NavLink to="/">Overview</NavLink>
        <NavLink to="/layout">Layout</NavLink>
        <NavLink to="/rss">RSS</NavLink>
        <NavLink to="/crawler">Crawler</NavLink>
        <NavLink to="/settings">Settings</NavLink>

        {dev && <NavLink to="/components">Components</NavLink>}

        {/* Dev toggle — right side */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 select-none">Dev</span>
          <button
            role="switch"
            aria-checked={dev}
            onClick={() => setDev((v) => !v)}
            title={dev ? 'Disable dev mode' : 'Enable dev mode'}
            className={[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
              'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              dev ? 'bg-amber-500' : 'bg-slate-700',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200',
                dev ? 'translate-x-4' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        </div>
      </nav>

      <main className="p-6">
        <Outlet />
      </main>

      <ErrorLogPanel />
    </div>
  )
}

// ── Routes ─────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Overview</h1>
      <p className="text-slate-400">Welcome to Dasher Admin. Use the navigation above to configure your dashboard.</p>
    </div>
  ),
})

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/layout',
  component: LayoutPage,
})

const rssRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rss',
  component: () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">RSS Feeds</h1>
      <p className="text-slate-400">Manage RSS feed sources.</p>
    </div>
  ),
})

const crawlerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crawler',
  component: () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Web Crawler</h1>
      <p className="text-slate-400">Configure crawler rules and view LLM-analyzed results.</p>
    </div>
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-slate-400">Configure Home Assistant, SABnzbd, Unifi, and Ollama connections.</p>
    </div>
  ),
})

const componentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components',
  component: ComponentsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  layoutRoute,
  rssRoute,
  crawlerRoute,
  settingsRoute,
  componentsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
