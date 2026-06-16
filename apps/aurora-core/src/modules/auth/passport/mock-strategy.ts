import { Strategy as CustomStrategy } from 'passport-custom';
import passport from 'passport';
import { Request as ExRequest, Response as ExResponse } from 'express';
import { SecurityGroup } from '../../../helpers/security';

passport.use(
  'mock',
  new CustomStrategy((req, callback) => {
    callback(null, {
      id: req.body.id ?? 'dev',
      name: req.body.name ?? 'dev',
      roles: req.body.roles ?? [SecurityGroup.ADMIN],
    });
  }),
);
