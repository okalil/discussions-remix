import {
  auth as authMiddleware,
  requireAuth as requireAuthMiddleware,
  createSessionAuthScheme,
} from 'remix/auth-middleware';
import { redirect } from 'remix/response/redirect';
import { Session } from 'remix/session';

import { SessionService } from '../core/session.ts';
import type { User } from '../core/user.types.ts';
import { routes } from '../routes.ts';

export function auth() {
  return authMiddleware({
    schemes: [
      createSessionAuthScheme({
        read(session) {
          const auth = session.get('auth');
          if (typeof auth !== 'string') return null;
          return auth;
        },
        async verify(userSessionId, context) {
          const sessionService = context.get(SessionService)!;
          const userSession = await sessionService.getSession(userSessionId);
          if (!userSession) return null;
          return userSession.user;
        },
        invalidate(session) {
          session.unset('auth');
        },
      }),
    ],
  });
}

export function requireAuth() {
  return requireAuthMiddleware<User>({
    onFailure(context) {
      const session = context.get(Session)!;
      session.flash('error', 'Hold on! You need to log in first.');
      return redirect(
        routes.auth.login.index.href(null, { returnTo: context.request.url }),
      );
    },
  });
}
