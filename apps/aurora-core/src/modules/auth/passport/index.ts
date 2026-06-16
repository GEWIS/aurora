import passport from 'passport';
import { AuthUser } from '../auth-user';
import './oidc-strategy';
import './api-key-strategy';
import './mock-strategy';
import { Request as ExRequest, Response as ExResponse } from 'express';

passport.serializeUser((user, done) => {
  done(null, JSON.stringify(user));
});

passport.deserializeUser((json: string, done) => {
  const user = JSON.parse(json);
  if (user == null) return done(null, false);
  return done(null, user as AuthUser);
});

export const authResponse = (req: ExRequest, res: ExResponse): void => {
  res.status(200).send(req.user);
};
