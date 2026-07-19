import * as arctic from 'arctic';
import { completeAuth } from 'remix/auth';
import { createCookie } from 'remix/cookie';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { env } from '../../../env.ts';
import { routes } from '../../../routes.ts';

const cookie = createCookie('state', {
  secure: env.NODE_ENV === 'production',
  path: '/',
  httpOnly: true,
  maxAge: 10 * 60, // 10 min
});

export default createController(routes.auth.social, {
  actions: {
    async start({ params, accountService }) {
      const state = arctic.generateState();
      const url = accountService.createProviderAuthorizationURL(
        params.provider,
        state,
      );
      return redirect(url, {
        headers: [['set-cookie', await cookie.serialize(state)]],
      });
    },
    async finish(context) {
      const code = context.url.searchParams.get('code');
      if (!code) throw new Response('Invalid Code', { status: 400 });

      const state = context.url.searchParams.get('state');
      const sessionState = await cookie.parse(context.headers.get('cookie'));
      if (!state || state !== sessionState)
        throw new Response('Invalid State', { status: 400 });

      const user = await context.accountService.linkProviderAccount(
        context.params.provider,
        code,
      );

      const userSession = await context.sessionService.createSession(user.id);
      const session = completeAuth(context);
      session.set('auth', userSession.id);

      session.flash('success', 'Signed in successfully!');
      return redirect(routes.discussions.index.href());
    },
  },
});
