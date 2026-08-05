import { StreamManager } from '../stream-manager';
import { Router, Request as ExRequest, Response as ExResponse } from 'express';

export function screenshareRouter(manager: StreamManager): Router {
  const router = Router();

  router.post('/session', (req: ExRequest, res: ExResponse) => {
    res.status(201).json(manager.startScreenshare());
  });

  router.delete('/session', async (req: ExRequest, res: ExResponse) => {
    await manager.stopScreenshare();
    res.sendStatus(204);
  });

  return router;
}
