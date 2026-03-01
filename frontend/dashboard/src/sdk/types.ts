import type { ComponentType } from 'react'

// ── Settings Schema ────────────────────────────────────────────────────────────
// First draft of the declarative settings API.
// Not yet rendered — this schema will drive the config form the admin UI
// generates when a user adds or edits a widget instance.
// Each field maps to exactly one key in the widget's config JSON object.

export type SettingField =
  | {
      type: 'text'
      key: string
      label: string
      description?: string
      default?: string
      placeholder?: string
      required?: boolean
    }
  | {
      type: 'number'
      key: string
      label: string
      description?: string
      default?: number
      min?: number
      max?: number
      step?: number
      required?: boolean
    }
  | {
      type: 'boolean'
      key: string
      label: string
      description?: string
      default?: boolean
      required?: boolean
    }
  | {
      type: 'select'
      key: string
      label: string
      description?: string
      options: Array<{ label: string; value: string }>
      default?: string
      required?: boolean
    }
  | {
      type: 'url'
      key: string
      label: string
      description?: string
      default?: string
      placeholder?: string
      required?: boolean
    }
  | {
      // Rendered as a password input; value is never echoed in plain text
      type: 'secret'
      key: string
      label: string
      description?: string
      required?: boolean
    }

export interface WidgetSettingsSchema {
  fields: SettingField[]
}

// ── Widget Props ───────────────────────────────────────────────────────────────
// All widget components receive this shape. TConfig is the widget's own config
// interface; it defaults to a plain object so untyped widgets still compile.

export interface WidgetProps<TConfig = Record<string, unknown>> {
  config: TConfig
  instanceId: string
  name: string
}

// ── Widget Definition ──────────────────────────────────────────────────────────
// The descriptor object every widget exports. Register it once at startup;
// the grid and admin UI resolve widgets by `type` at render time.

export interface WidgetDefinition<TConfig = Record<string, unknown>> {
  /** Unique string key — must match widget_type stored in the database */
  type: string
  /** Human-readable name shown in the admin widget picker */
  label: string
  /** One-line description shown below the label in the picker */
  description?: string
  /** The React component that renders this widget */
  component: ComponentType<WidgetProps<TConfig>>
  /** Defaults merged with the stored config before the component receives it */
  defaultConfig?: Partial<TConfig>
  /** Suggested initial grid size when a new instance is created */
  defaultSize?: { w: number; h: number }
  /** Declarative schema that will drive the admin config form (not yet rendered) */
  settingsSchema?: WidgetSettingsSchema
}

// ── Widget Instance ────────────────────────────────────────────────────────────
// Shape returned by GET /api/widgets/instances — mirrors the DB row.
// SYNC: WidgetInstance ↔ frontend/admin/src/api/widgets.ts WidgetInstance
// Fields must stay identical. Extract to shared npm workspace package when added.
export interface WidgetInstance {
  id: string
  widget_type: string
  name: string
  config: Record<string, unknown>
  grid_x: number
  grid_y: number
  grid_w: number
  grid_h: number
  background_color: string | null
}
