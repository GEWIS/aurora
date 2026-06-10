import './env';
import { createServer } from 'http';
import * as fs from 'fs';
import path from 'node:path';
import logger from './logger';
import createHttp from './http';
import dataSource from './database';
import HandlerManager from './modules/root/handler-manager';
import createWebsocket from './socketio';
import './modules/audit/audit-logger';
import { SpotifyApiHandler, SpotifyTrackHandler } from './modules/spotify';
import LightsControllerManager from './modules/root/lights-controller-manager';
import ModeManager from './modules/modes/mode-manager';
import { BeatManager } from './modules/beats';
import {
  initBackofficeSynchronizer,
  initBackofficeBeatSynchronizer,
} from './modules/backoffice/synchronizer';
import { SocketioNamespaces } from './socketio-namespaces';
import SocketConnectionManager from './modules/root/socket-connection-manager';
import { FeatureFlagManager, ServerSettingsStore } from './modules/server-settings';
import { EmitterStore } from './modules/events';
// do not remove; used for extending existing types
import Types from './types';
import { OrderManager } from './modules/orders';
import TimedEventsService from './modules/timed-events/timed-events-service';
import LightsSwitchManager from './modules/root/lights-switch-manager';
import { TrelloPosterManager } from './modules/handlers/screen/poster/trello/trello-poster-manager';

async function createApp(): Promise<void> {
  // Fix for production issue where a Docker volume overwrites the contents of a folder instead of merging them
  if (process.env.STATIC_FILES_LOCATION) {
    const audioFromPath = path.join(__dirname, '../public/audio');
    const audioToPath = path.join(process.env.STATIC_FILES_LOCATION, '/audio');

    if (!fs.existsSync(audioToPath)) {
      fs.mkdirSync(audioToPath);
    }
    // Empty the directory before filling it with new files
    fs.readdirSync(audioToPath).forEach((f) => {
      if (f === 'lost+found') return; // skip lost+found folder that is created in ext4 filesystems
      fs.rmSync(path.join(audioToPath, f), { recursive: true, force: true });
    });
    fs.cpSync(audioFromPath, audioToPath, { recursive: true });
  }

  await dataSource.initialize();

  await ServerSettingsStore.getInstance().initialize();
  const featureFlagManager = new FeatureFlagManager();
  await TimedEventsService.getInstance().registerAllDatabaseEvents();

  const app = await createHttp();
  const httpServer = createServer(app);
  const io = createWebsocket(httpServer);

  const emitterStore = EmitterStore.getInstance();
  BeatManager.getInstance().init(emitterStore.beatEmitter);

  const lightsSwitchManager = LightsSwitchManager.getInstance();
  const handlerManager = HandlerManager.getInstance(io, emitterStore);
  await handlerManager.init();
  const socketConnectionManager = new SocketConnectionManager(
    handlerManager,
    lightsSwitchManager,
    io,
    emitterStore.backofficeSyncEmitter,
  );
  await socketConnectionManager.clearSavedSocketIds();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO should this be used somewhere?
  const lightsControllerManager = new LightsControllerManager(
    io.of(SocketioNamespaces.LIGHTS),
    handlerManager,
    lightsSwitchManager,
    emitterStore.musicEmitter,
  );

  ModeManager.getInstance().init(emitterStore);

  if (
    process.env.SPOTIFY_ENABLE === 'true' &&
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET &&
    process.env.SPOTIFY_REDIRECT_URI
  ) {
    logger.info('Initialize Spotify...');
    await SpotifyApiHandler.getInstance().init();
    await SpotifyTrackHandler.getInstance().init(emitterStore.musicEmitter);
  }

  if (process.env.TRELLO_BOARD_ID && process.env.TRELLO_KEY && process.env.TRELLO_TOKEN) {
    logger.info('Initialize Trello posters...');
    const trelloPosterManager = new TrelloPosterManager();
    trelloPosterManager.reloadPosters().catch((e) => logger.error(e));
  }

  if (featureFlagManager.flagIsEnabled('Orders')) {
    OrderManager.getInstance().init(emitterStore.orderEmitter);
  }

  initBackofficeSynchronizer(io.of(SocketioNamespaces.BACKOFFICE), emitterStore);
  // Separate namespace, so clients are not obligated to receive multiple incoming
  // beat streams from different (non-important) beat generators.
  initBackofficeBeatSynchronizer(io.of(SocketioNamespaces.BACKOFFICE_BEAT), emitterStore);

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => logger.info(`Listening at http://localhost:${port}`));
}

if (require.main === module) {
  process.on('SIGINT', () => {
    // this is only called on ctrl+c, not restart
    process.kill(process.pid, 'SIGINT');
  });

  // Only execute the application directly if this is the main execution file.
  createApp().catch((e) => {
    logger.fatal(e);
  });
}
