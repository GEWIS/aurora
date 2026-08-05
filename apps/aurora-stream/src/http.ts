import express, {
  Express,
  Request as ExRequest,
  Response as ExResponse,
  NextFunction,
} from 'express';
import { pinoHttp } from 'pino-http';
import { setupErrorHandler } from './error';
import { requireSecret } from './middleware/require-secret';
import { ytRouter } from './routes/yt';
import { StreamManager } from './stream-manager';
import { screenshareRouter } from './routes/screenshare';
import { authRouter } from './routes/auth';
import logger from './logger';

export function createHTTPApp(manager: StreamManager): Express {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      useLevel: 'debug',
    }),
  );

  app.use(express.json());
  app.use(requireSecret);

  app.use('/yt', ytRouter(manager));
  app.use('/screenshare', screenshareRouter(manager));
  app.get('/state', (req: ExRequest, res: ExResponse) => {
    res.json(manager.state());
  });

  setupErrorHandler(app);
  return app;
}

export function createMediaMTXApp(manager: StreamManager): Express {
  const app = express();

  app.use(express.json());
  app.use(authRouter(manager));

  setupErrorHandler(app);
  return app;
}
