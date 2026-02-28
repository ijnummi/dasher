import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from '@tanstack/react-router'
import LayoutPage from './pages/LayoutPage'

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 px-6 py-3 flex gap-6 text-sm">
        <span className="font-bold text-slate-100 mr-4">Dasher Admin</span>
        <Link to="/" className="text-slate-400 hover:text-slate-100 [&.active]:text-white">
          Overview
        </Link>
        <Link to="/layout" className="text-slate-400 hover:text-slate-100 [&.active]:text-white">
          Layout
        </Link>
        <Link to="/rss" className="text-slate-400 hover:text-slate-100 [&.active]:text-white">
          RSS
        </Link>
        <Link to="/crawler" className="text-slate-400 hover:text-slate-100 [&.active]:text-white">
          Crawler
        </Link>
        <Link to="/settings" className="text-slate-400 hover:text-slate-100 [&.active]:text-white">
          Settings
        </Link>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  ),
})

// Routes
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  layoutRoute,
  rssRoute,
  crawlerRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
