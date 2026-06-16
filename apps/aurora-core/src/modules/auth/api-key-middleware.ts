import { NextFunction, Request, Response } from 'express';
import dataSource from '../../database';
import { ApiKey } from './entities';
import logger from '../../logger';

export default async function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  // User already found, so nothing for us to do here
  if (req.user) {
    next();
    return;
  }

  const rawKey = req.headers['x-api-key'];
  if (!rawKey) {
    next();
    return;
  }

  // Format the key to the appropriate format
  let key: string;
  if (Array.isArray(rawKey)) {
    if (rawKey.length !== 1) {
      next();
      return;
    }
    key = rawKey[0];
  } else {
    key = rawKey;
  }

  try {
    // Find the user in the database
    const identity = await dataSource.getRepository(ApiKey).findOne({ where: { key } });
    if (identity) {
      req.user = identity.asAuthUser();
    }
  } catch (e) {
    logger.error(e);
  } finally {
    // Always continue
    next();
  }
}
