import bodyParser from 'body-parser';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { pinoHttp } from 'pino-http';
import { RegisterRoutes } from '../build/routes';
import apiDocs from '../build/swagger.json';
import { SessionMiddleware, apiKeyMiddleware } from './modules/auth';
import { setupErrorHandler } from './error';
import { authResponse } from './modules/auth/passport';
import { IntegrationUserActivityMiddleware } from './modules/auth/integration';

const origins = process.env.CORS_ORIGINS?.split(', ');
export const enableCors = origins !== undefined && origins.length > 0;

export function customOrigin(
  requestOrigin: string | undefined,
  callback: (
    err: Error | null,
    origin?: boolean | string | RegExp | (boolean | string | RegExp)[],
  ) => void,
) {
  if (origins && origins.length > 0) {
    callback(null, origins);
  } else {
    callback(new Error('No origins defined'), requestOrigin);
  }
}

/**
 * Create an Express instance to listen to HTTP calls.
 * Directly assigns all middlewares and routes.
 *
 * HTTP is only used for the end user to interact with the software,
 * i.e. changing settings or modes.
 */
export default async function createHttp() {
  const app = express();

  app.use(
    pinoHttp({
      useLevel: 'debug',
    }),
  );

  app.use(
    cors({
      allowedHeaders: ['Cookie', 'Cookies'],
      origin: enableCors ? customOrigin : undefined,
    }),
  );

  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.use(bodyParser.json());
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(SessionMiddleware.getInstance().get());

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(apiKeyMiddleware);
  app.use(IntegrationUserActivityMiddleware);

  RegisterRoutes(app);

  app.post('/api/auth/oidc', passport.authenticate('oidc'), authResponse);
  app.post('/api/auth/key', passport.authenticate('apikey'), authResponse);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

  if (process.env.NODE_ENV === 'development') {
    app.post('/api/auth/mock', passport.authenticate('mock'), authResponse);
    app.use('/static', express.static('public'));
  }

  setupErrorHandler(app);
  return app;
}
