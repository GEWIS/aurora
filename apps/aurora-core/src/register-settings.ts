// Importing each module's settings file registers its defaults on `ISettings`
// via declaration merging as a side effect of the import.
import './modules/sudosos/sudosos-settings';
import './modules/modes/mode-settings';
import './modules/handlers/screen/screen-handler-settings';
import './modules/handlers/screen/poster/poster-screen-handler-settings';
import './modules/handlers/screen/info/info-screen-settings';
import './modules/orders/order-settings';

/**
 * Every host/bootstrap (see index.ts and integration-test/shared/test-app.ts)
 * must call this before `ServerSettingsStore.getInstance().initialize()`.
 */
export function registerAllSettings(): void {}
