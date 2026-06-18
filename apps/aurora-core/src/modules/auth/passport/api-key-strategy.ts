import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { HttpStatusCode } from 'axios';
import { HttpApiException } from '../../../helpers/custom-error';
import database from '../../../database';
import { ApiKey } from '../entities';

passport.use(
  'apikey',
  new CustomStrategy(async (req, callback) => {
    if (!req.body || !req.body.key) {
      callback(new HttpApiException(HttpStatusCode.BadRequest, 'Missing API Key'), undefined);
    }

    const identity = await database.getRepository(ApiKey).findOne({
      where: { key: req.body.key },
      relations: { audio: true, lightsController: true, screen: true, integrationUser: true },
    });
    if (!identity) {
      callback(new HttpApiException(HttpStatusCode.NotFound, 'Key not found'), undefined);
      return;
    }

    callback(null, identity.asAuthUser());
  }),
);
