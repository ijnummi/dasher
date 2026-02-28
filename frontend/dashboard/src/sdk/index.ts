export type {
  WidgetDefinition,
  WidgetProps,
  WidgetInstance,
  WidgetSettingsSchema,
  SettingField,
} from './types'

export {
  registerWidget,
  resolveWidget,
  getAllDefinitions,
  getRegisteredTypes,
} from './registry'
