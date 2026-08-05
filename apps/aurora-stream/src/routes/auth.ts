import { MediaMtxAuthRequest, StreamManager } from '../stream-manager';
import { Router, Request as ExRequest, Response as ExResponse } from 'express';
import { HttpError } from '../error';

export interface NotReadyQuery {
  path?: string;
}

export function authRouter(manager: StreamManager): Router {
  const router = Router();

  router.post('/auth', (req: ExRequest, res: ExResponse) => {
    if (!manager.authorize((req.body ?? {}) as MediaMtxAuthRequest)) {
      throw new HttpError(401, 'Not authorized.');
    }

    res.sendStatus(204);
  });

  router.post('/not-ready', (req: ExRequest, res: ExResponse) => {
    const { path } = req.query as NotReadyQuery;
    if (typeof path !== 'string' || path.length === 0) {
      throw new HttpError(400, 'Invalid or missing path.');
    }

    manager.onPathNotReady(path);
    res.sendStatus(204);
  });

  return router;
}
