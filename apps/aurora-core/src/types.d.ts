import { AuthUser } from './modules/auth';

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}
