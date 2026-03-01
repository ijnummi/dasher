// Registers all built-in widget types with the SDK registry.
// Import this file once at app startup (App.tsx does this).
// External widget packages can register themselves the same way —
// just import their registration module before the grid renders.

import { registerWidget } from '../../sdk'
import { definition as clockDef } from './ClockWidget'
import { definition as dummyDef } from './DummyWidget'
import { definition as fakeRssDef } from './FakeRssWidget'
import { definition as gmailDef } from './GmailWidget'
import { definition as htmlDef } from './HtmlWidget'
import { definition as sabnzbdDef } from './SABnzbdWidget'
import { definition as techAboutDef } from './TechAboutWidget'
import { definition as unifiDef } from './UnifiWidget'
import { definition as widgetDirectoryDef } from './WidgetDirectoryWidget'

registerWidget(clockDef)
registerWidget(dummyDef)
registerWidget(fakeRssDef)
registerWidget(gmailDef)
registerWidget(htmlDef)
registerWidget(sabnzbdDef)
registerWidget(techAboutDef)
registerWidget(unifiDef)
registerWidget(widgetDirectoryDef)
