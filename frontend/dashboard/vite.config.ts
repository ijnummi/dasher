import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

function readJson(path: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return {}
  }
}

// Parse `dependencies = ["pkg>=1.0", ...]` from pyproject.toml
function parsePyprojectDeps(content: string): Record<string, string> {
  const match = content.match(/^dependencies\s*=\s*\[([\s\S]*?)^\]/m)
  if (!match) return {}
  const deps: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/"([A-Za-z0-9_-]+)\[?[A-Za-z]*\]?\s*([^",]*)"/)
    if (m) deps[m[1]] = m[2].trim() || '*'
  }
  return deps
}

function pickDeps(pkg: Record<string, unknown>, keys: string[]): Record<string, string> {
  const deps = { ...(pkg.dependencies as Record<string, string>), ...(pkg.devDependencies as Record<string, string>) }
  return Object.fromEntries(keys.filter((k) => deps[k]).map((k) => [k, deps[k]]))
}

function readText(path: string): string {
  try { return readFileSync(path, 'utf-8') } catch { return '' }
}

const dashboardPkg = readJson(resolve(__dirname, 'package.json'))
const adminPkg     = readJson(resolve(__dirname, '../admin/package.json'))
const pyproject    = readText(resolve(__dirname, '../../backend/pyproject.toml'))

const VERSIONS = {
  backend: parsePyprojectDeps(pyproject),
  dashboard: pickDeps(dashboardPkg, ['react', 'react-dom', 'react-grid-layout', '@tanstack/react-query', 'zustand', 'tailwindcss', 'vite']),
  admin:     pickDeps(adminPkg,     ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query', 'jotai', 'tailwindcss', 'vite']),
}

export default defineConfig({
  base: '/dashboard/',
  define: {
    __VERSIONS__: JSON.stringify(VERSIONS),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
        ws: true,
      },
    },
  },
})
