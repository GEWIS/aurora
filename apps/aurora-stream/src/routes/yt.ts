import { StreamManager } from '../stream-manager';
import { Router, Response as ExResponse, Request as ExRequest } from 'express';
import { HttpError } from '../error';

export interface ResolveRequest {
  url: string;
}

export interface PlayRequest {
  ref: string;
  position: number; // seconds into the media
}

export function ytRouter(manager: StreamManager): Router {
  const router = Router();

  router.post('/resolve', async (req: ExRequest, res: ExResponse) => {
    const { url } = (req.body ?? {}) as Partial<ResolveRequest>;
    if (typeof url !== 'string' || url.length === 0) {
      throw new HttpError(400, 'Invalid or missing url.');
    }

    res.json(await manager.resolveYt(url));
  });

  router.post('/play', async (req: ExRequest, res: ExResponse) => {
    const { ref, position } = (req.body ?? {}) as Partial<PlayRequest>;
    if (typeof ref !== 'string' || ref.length === 0) {
      throw new HttpError(400, 'Invalid or missing ref.');
    }
    if (typeof position !== 'number' || !Number.isFinite(position) || position < 0) {
      throw new HttpError(400, 'Position must be a number of seconds, at least 0.');
    }

    await manager.playYt(ref, position);
    res.sendStatus(204);
  });

  router.post('/stop', async (req: ExRequest, res: ExResponse) => {
    await manager.stopYt();
    res.sendStatus(204);
  });

  return router;
}
