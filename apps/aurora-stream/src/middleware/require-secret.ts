import { Request as ExRequest, Response as ExResponse, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import logger from '../logger';

export function requireSecret(req: ExRequest, res: ExResponse, next: NextFunction) {
  const expected = Buffer.from(process.env.STREAM_TOKEN ?? '');
  const got = Buffer.from(req.get('authorization')?.replace(/^Bearer /, '') ?? '');
  if (expected.length === 0 || got.length !== expected.length || !timingSafeEqual(got, expected)) {
    logger.warn({ path: req.path }, 'rejected request, invalid token.');
    res.sendStatus(401);
    return;
  }

  next();
}
