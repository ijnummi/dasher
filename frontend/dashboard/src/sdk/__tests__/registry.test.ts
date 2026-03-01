/**
 * Tests for the widget SDK registry — pure functions, no DOM needed.
 *
 * Each test imports from the registry module directly. Because the registry
 * uses a module-level Map, we clear it between tests via the register/resolve
 * API rather than reaching into internals.
 */
import { describe, it, expect } from 'vitest'
import {
  registerWidget,
  resolveWidget,
  getAllDefinitions,
  getRegisteredTypes,
} from '../registry'
import type { WidgetDefinition } from '../types'

// Minimal stub component — the registry only stores the reference.
const StubComponent = () => null

function makeWidget(type: string, label = 'Test Widget'): WidgetDefinition {
  return { type, label, component: StubComponent as any }
}

// The registry uses a module-level Map that persists across tests.
// We register unique types per test to avoid collision.

describe('registerWidget / resolveWidget', () => {
  it('resolves a registered widget by type', () => {
    const def = makeWidget('reg-test-clock')
    registerWidget(def)
    expect(resolveWidget('reg-test-clock')).toBe(def)
  })

  it('returns undefined for an unregistered type', () => {
    expect(resolveWidget('no-such-widget-xyz')).toBeUndefined()
  })

  it('overwrites a duplicate registration', () => {
    const first = makeWidget('reg-test-dup', 'First')
    const second = makeWidget('reg-test-dup', 'Second')
    registerWidget(first)
    registerWidget(second)
    expect(resolveWidget('reg-test-dup')?.label).toBe('Second')
  })
})

describe('getAllDefinitions', () => {
  it('includes all registered definitions', () => {
    registerWidget(makeWidget('reg-all-a'))
    registerWidget(makeWidget('reg-all-b'))
    const defs = getAllDefinitions()
    const types = defs.map((d) => d.type)
    expect(types).toContain('reg-all-a')
    expect(types).toContain('reg-all-b')
  })

  it('returns an array (not a Map or iterator)', () => {
    expect(Array.isArray(getAllDefinitions())).toBe(true)
  })
})

describe('getRegisteredTypes', () => {
  it('returns string keys', () => {
    registerWidget(makeWidget('reg-types-x'))
    const types = getRegisteredTypes()
    expect(types).toContain('reg-types-x')
    types.forEach((t) => expect(typeof t).toBe('string'))
  })

  it('length matches getAllDefinitions length', () => {
    expect(getRegisteredTypes().length).toBe(getAllDefinitions().length)
  })
})
