/**
 * Tests for widgetColor utilities — pure functions, no DOM needed.
 */
import { describe, it, expect } from 'vitest'
import {
  deterministicColor,
  randomWidgetColor,
  getBgTheme,
  resolveWidgetColor,
} from '../widgetColor'

// ── helpers ────────────────────────────────────────────────────────────────────

function isHex(s: string): boolean {
  return /^#[0-9a-f]{6}$/.test(s)
}

// ── deterministicColor ─────────────────────────────────────────────────────────

describe('deterministicColor', () => {
  it('returns a valid hex color', () => {
    expect(isHex(deterministicColor('abc123', true))).toBe(true)
    expect(isHex(deterministicColor('abc123', false))).toBe(true)
  })

  it('is stable — same id always produces the same color', () => {
    const c1 = deterministicColor('widget-id-42', true)
    const c2 = deterministicColor('widget-id-42', true)
    expect(c1).toBe(c2)
  })

  it('dark and light variants differ', () => {
    const dark = deterministicColor('same-id', true)
    const light = deterministicColor('same-id', false)
    expect(dark).not.toBe(light)
  })

  it('different ids produce different colors (probabilistic)', () => {
    const colors = new Set(
      ['id-1', 'id-2', 'id-3', 'id-4', 'id-5'].map((id) => deterministicColor(id, true))
    )
    // Very unlikely all five hash to the same hue bucket
    expect(colors.size).toBeGreaterThan(1)
  })
})

// ── randomWidgetColor ──────────────────────────────────────────────────────────

describe('randomWidgetColor', () => {
  it('returns a valid hex color for dark mode', () => {
    expect(isHex(randomWidgetColor(true))).toBe(true)
  })

  it('returns a valid hex color for light mode', () => {
    expect(isHex(randomWidgetColor(false))).toBe(true)
  })
})

// ── getBgTheme ─────────────────────────────────────────────────────────────────

describe('getBgTheme', () => {
  it('returns "light" for white (#ffffff)', () => {
    expect(getBgTheme('#ffffff')).toBe('light')
  })

  it('returns "dark" for black (#000000)', () => {
    expect(getBgTheme('#000000')).toBe('dark')
  })

  it('returns "dark" for a non-hex string (fallback)', () => {
    expect(getBgTheme('transparent')).toBe('dark')
    expect(getBgTheme('')).toBe('dark')
  })

  it('returns "light" for a clearly bright color', () => {
    expect(getBgTheme('#eeeeee')).toBe('light')
  })

  it('returns "dark" for a clearly dark color', () => {
    expect(getBgTheme('#111122')).toBe('dark')
  })
})

// ── resolveWidgetColor ─────────────────────────────────────────────────────────

describe('resolveWidgetColor', () => {
  it('uses override when present', () => {
    const result = resolveWidgetColor('id', '#api-color', '#override', true)
    expect(result).toBe('#override')
  })

  it('falls back to apiColor when no override', () => {
    const result = resolveWidgetColor('id', '#api-color', undefined, true)
    expect(result).toBe('#api-color')
  })

  it('falls back to deterministicColor when both are absent', () => {
    const result = resolveWidgetColor('test-id', null, undefined, true)
    expect(isHex(result)).toBe(true)
    expect(result).toBe(deterministicColor('test-id', true))
  })

  it('uses override even when apiColor is also present', () => {
    const result = resolveWidgetColor('id', '#api', '#over', false)
    expect(result).toBe('#over')
  })
})
