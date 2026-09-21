/* istanbul ignore file -- composition root: wiring only, nothing to assert about it */
/* v8 ignore start */
import type { ServiceIdentifier } from 'inversify';

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

/**
 * Bind the long-lived services that controllers depend on into the container.
 */
export function registerServices(): void {
  const services: [ServiceIdentifier<unknown>, unknown][] = [
    [HandlerManager, HandlerManager.getInstance()],
    [ModeManager, ModeManager.getInstance()],
    [OrderManager, OrderManager.getInstance()],
    [BeatManager, BeatManager.getInstance()],
    [LightsSwitchManager, LightsSwitchManager.getInstance()],
    [TimedEventsService, TimedEventsService.getInstance()],
    [SpotifyApiHandler, SpotifyApiHandler.getInstance()],
    [SpotifyTrackHandler, SpotifyTrackHandler.getInstance()],
    [FeatureFlagManager, FeatureFlagManager.getInstance()],
    [ServerSettingsStore, ServerSettingsStore.getInstance()],
  ];

  services.forEach(([service, instance]) => {
    if (container.isBound(service)) {
      container.rebindSync(service).toConstantValue(instance);
    } else {
      container.bind(service).toConstantValue(instance);
    }
  });
}
/* v8 ignore stop */
