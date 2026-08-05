import { Express, Response as ExResponse, Request as ExRequest, NextFunction } from 'express';
import logger from './logger';

export class HttpError extends Error {
  public constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function setupErrorHandler(app: Express) {
  app.use((req: ExRequest, res: ExResponse) => {
    res.status(404).send('Not Found');
  });

  app.use((err: unknown, req: ExRequest, res: ExResponse, next: NextFunction) => {
    if (err instanceof HttpError) {
      logger.warn({ path: req.path, status: err.status }, err.message);
      res.status(err.status).json({ message: err.message });
    } else {
      logger.error({ path: req.path, err }, 'unhandled error');
      res.status(500).json({ message: 'Internal server error.' });
    }

    next();
  });
}
