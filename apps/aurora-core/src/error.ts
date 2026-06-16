import { Response as ExResponse, Request as ExRequest, NextFunction, Express } from 'express';
import { ValidateError } from 'tsoa';
import { AxiosError } from 'axios';
import { HttpApiException, HttpStatusCode } from './helpers/custom-error';
import logger from './logger';
import { ApiError as TrelloAPIError } from './modules/handlers/screen/poster/trello/client';
import ModeDisabledError from './modules/modes/mode-disabled-error';
import { InvalidStateError } from './modules/modes/time-trail-race/time-trail-race-invalid-state-error';

export function setupErrorHandler(app: Express) {
  app.use((req: ExRequest, res: ExResponse) => {
    res.status(HttpStatusCode.NotFound).send({
      message: 'Not Found',
    });
  });

  app.use((err: unknown, req: ExRequest, res: ExResponse, next: NextFunction) => {
    if (err instanceof ValidateError) {
      logger.warn(`Caught '${HttpStatusCode.BadRequest} - Bad Request' for ${req.path}.`);
      res.status(HttpStatusCode.BadRequest).json({
        message: 'Bad Request',
        details: err?.fields,
      });
    } else if (err instanceof HttpApiException) {
      // Ignore unauthorized errors
      if (err.status !== HttpStatusCode.Unauthorized) {
        logger.warn(`Caught '${err.status} - ${err.name}' for ${req.path}.`);
      }
      res.status(err.status).json(err);
    } else if (err instanceof TrelloAPIError || err instanceof AxiosError) {
      logger.error(`Caught '${err.message} - ${err.name}' for ${req.path}.`);
      res.status(500).json('Internal server error.');
    } else if (err instanceof ModeDisabledError) {
      res.status(404).json(err.message);
    } else if (err instanceof InvalidStateError) {
      res.status(428).json(err.message);
    } else {
      logger.error(err);
      res.status(500).json('Internal server error.');
    }

    next();
  });
}
