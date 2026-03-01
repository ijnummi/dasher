/**
 * Tests for admin API helper functions.
 * fetch() is mocked at the global level so no network calls occur.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchInstances, patchWidgetName, patchWidgetColor, fetchTypes } from '../widgets'

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

// ── fetchInstances ─────────────────────────────────────────────────────────────

describe('fetchInstances', () => {
  it('calls GET /api/widgets/instances', async () => {
    const fakeFetch = mockFetch({ widgets: [] })
    vi.stubGlobal('fetch', fakeFetch)

    await fetchInstances()

    expect(fakeFetch).toHaveBeenCalledOnce()
    const [url, init] = fakeFetch.mock.calls[0]
    expect(url).toBe('/api/widgets/instances')
    expect(init).toBeUndefined()
  })

  it('returns the widgets array from the response', async () => {
    const widget = { id: '1', widget_type: 'clock', name: '', config: {}, grid_x: 0, grid_y: 0, grid_w: 2, grid_h: 2, background_color: null }
    vi.stubGlobal('fetch', mockFetch({ widgets: [widget] }))

    const result = await fetchInstances()
    expect(result).toEqual([widget])
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch({}, 500))
    await expect(fetchInstances()).rejects.toThrow('Failed to fetch widget instances')
  })
})

// ── patchWidgetName ────────────────────────────────────────────────────────────

describe('patchWidgetName', () => {
  it('sends PATCH with correct URL and body', async () => {
    const fakeFetch = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fakeFetch)

    await patchWidgetName('widget-42', 'My Clock')

    expect(fakeFetch).toHaveBeenCalledOnce()
    const [url, init] = fakeFetch.mock.calls[0]
    expect(url).toBe('/api/widgets/instances/widget-42/name')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ name: 'My Clock' })
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch({}, 404))
    await expect(patchWidgetName('bad-id', 'x')).rejects.toThrow('Failed to update name')
  })
})

// ── patchWidgetColor ───────────────────────────────────────────────────────────

describe('patchWidgetColor', () => {
  it('sends PATCH with color value', async () => {
    const fakeFetch = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fakeFetch)

    await patchWidgetColor('widget-7', '#ff0000')

    const [url, init] = fakeFetch.mock.calls[0]
    expect(url).toBe('/api/widgets/instances/widget-7/color')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ background_color: '#ff0000' })
  })

  it('sends null to clear the color', async () => {
    const fakeFetch = mockFetch({ ok: true })
    vi.stubGlobal('fetch', fakeFetch)

    await patchWidgetColor('widget-7', null)

    const [, init] = fakeFetch.mock.calls[0]
    expect(JSON.parse(init.body)).toEqual({ background_color: null })
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch({}, 500))
    await expect(patchWidgetColor('id', '#123')).rejects.toThrow('Failed to update color')
  })
})

// ── fetchTypes ─────────────────────────────────────────────────────────────────

describe('fetchTypes', () => {
  it('returns the types array', async () => {
    vi.stubGlobal('fetch', mockFetch({ types: ['clock', 'rss'] }))
    const result = await fetchTypes()
    expect(result).toEqual(['clock', 'rss'])
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetch({}, 503))
    await expect(fetchTypes()).rejects.toThrow('Failed to fetch widget types')
  })
})
