import type { WidgetDefinition } from './types'

const _registry = new Map<string, WidgetDefinition>()

/** Register a widget definition. Call this once per widget type at app startup. */
export function registerWidget<TConfig>(def: WidgetDefinition<TConfig>): void {
  if (_registry.has(def.type)) {
    console.warn(`[dasher-sdk] Widget type "${def.type}" already registered — overwriting.`)
  }
  _registry.set(def.type, def as WidgetDefinition)
}

/** Look up a registered widget by its type key. Returns undefined if not found. */
export function resolveWidget(type: string): WidgetDefinition | undefined {
  return _registry.get(type)
}

/** All registered widget definitions, in insertion order. */
export function getAllDefinitions(): WidgetDefinition[] {
  return Array.from(_registry.values())
}

/** All registered type keys. */
export function getRegisteredTypes(): string[] {
  return Array.from(_registry.keys())
}
