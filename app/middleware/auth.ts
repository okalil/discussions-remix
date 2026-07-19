import {
  auth as authMiddleware,
  createSessionAuthScheme,
} from 'remix/middleware/auth';

import { SessionService } from '../core/session.ts';

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
