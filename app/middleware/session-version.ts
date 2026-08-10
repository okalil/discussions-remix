import type { Middleware } from 'remix/router';
import { Session } from 'remix/session';

import { sessionVersionCookie } from '../ws/protocol.ts';

/**
 * Keeps a readable `__sv` cookie in sync with the session id so the client can
 * reconnect the frame WebSocket when auth/session changes.
 */
export function sessionVersion(): Middleware {
  return async (context, next) => {
    let response = await next();
    const session = context.get(Session);
    if (!session || !(session.dirty || session.destroyed)) return response;

    // Clone so we can append even if an earlier middleware returned an immutable response.
    response = new Response(response.body, response);

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
