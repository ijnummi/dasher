// Registers all built-in widget types with the SDK registry.
// Import this file once at app startup (App.tsx does this).
// External widget packages can register themselves the same way —
// just import their registration module before the grid renders.

import { registerWidget } from '../../sdk'
import { definition as dummyDef } from './DummyWidget'
import { definition as gmailDef } from './GmailWidget'
import { definition as techAboutDef } from './TechAboutWidget'

registerWidget(dummyDef)
registerWidget(gmailDef)
registerWidget(techAboutDef)
