import { env } from 'cloudflare:workers';
import { createCookie } from 'remix/cookie';
import type { Middleware } from 'remix/router';
import { Session } from 'remix/session';
import { session as sessionMiddleware } from 'remix/session-middleware';
import { createCookieSessionStorage } from 'remix/session-storage/cookie';

import { SESSION_VERSION_COOKIE } from '../ws/protocol.ts';

const sessionCookie = createCookie('__session', {
  secrets: [env.SESSION_SECRET],
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  path: '/',
});

/** Readable change-detection cookie for frame WebSocket reconnects. Not a secret. */
const sessionVersionCookie = createCookie(SESSION_VERSION_COOKIE, {
  httpOnly: false,
  secure: true,
  sameSite: 'Lax',
  path: '/',
});

const sessionStorage = createCookieSessionStorage();

export function session(): Middleware<{
  key: typeof Session;
  value: Session;
  property: 'session';
}> {
  const defaultSessionMiddleware = sessionMiddleware(
    sessionCookie,
    sessionStorage,
  );

  return async (context, next) => {
    const response = await defaultSessionMiddleware(context, next);
    const session = context.get(Session);
    if (!session || !(session.dirty || session.destroyed)) return response;

    // Inner middleware already cloned when writing __session; append in place.
    if (session.destroyed) {
      response.headers.append(
        'Set-Cookie',
        await sessionVersionCookie.serialize('', { expires: new Date(0) }),
      );
    } else {
      response.headers.append(
        'Set-Cookie',
        await sessionVersionCookie.serialize(session.id),
      );
    }
    return response;
  };
}
