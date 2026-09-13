/* istanbul ignore file -- composition root: wiring only, nothing to assert about it */
/* v8 ignore start */
import { container } from './ioc';

import HandlerManager from './modules/root/handler-manager';
import ModeManager from './modules/modes/mode-manager';
import OrderManager from './modules/orders/order-manager';
import BeatManager from './modules/beats/beat-manager';
import LightsSwitchManager from './modules/lights/lights-switch-manager';
import TimedEventsService from './modules/timed-events/timed-events-service';
import SpotifyApiHandler from './modules/spotify/spotify-api-handler';
import SpotifyTrackHandler from './modules/spotify/spotify-track-handler';
import { FeatureFlagManager, ServerSettingsStore } from './modules/server-settings';

export const SERVICES = [
  HandlerManager,
  ModeManager,
  OrderManager,
  BeatManager,
  LightsSwitchManager,
  TimedEventsService,
  SpotifyApiHandler,
  SpotifyTrackHandler,
  FeatureFlagManager,
  ServerSettingsStore,
];

/**
 * Bind the long-lived services that controllers depend on into the container.
 */
export function registerServices(): void {
  SERVICES.forEach((service) => {
    container.registerInstance(service as never, service.getInstance() as never);
  });
}
/* v8 ignore stop */
