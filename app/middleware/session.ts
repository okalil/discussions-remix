import { env } from 'cloudflare:workers';
import { createCookie } from 'remix/cookie';
import { session as sessionMiddleware } from 'remix/session-middleware';
import { createCookieSessionStorage } from 'remix/session-storage/cookie';

const sessionCookie = createCookie('__session', {
  secrets: [env.SESSION_SECRET],
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  path: '/',
});
const sessionStorage = createCookieSessionStorage();

export function session() {
  return sessionMiddleware(sessionCookie, sessionStorage);
}
