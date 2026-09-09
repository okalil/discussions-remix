import { createController } from '@discussions/router';
import { env } from 'cloudflare:workers';
import {
  completeAuth,
  createGitHubAuthProvider,
  finishExternalAuth,
  startExternalAuth,
} from 'remix/auth';
import { redirect } from 'remix/response/redirect';

import { routes } from '../../../routes.ts';

export default createController(routes.auth.social, {
  actions: {
    async start(context) {
      const provider = getSocialProvider(
        context.params.provider,
        context.url.origin,
      );
      return startExternalAuth(provider, context);
    },
    async finish(context) {
      const provider = getSocialProvider(
        context.params.provider,
        context.url.origin,
      );

      const finished = await finishExternalAuth(provider, context).catch(
        (error) => {
          console.error('OAuth callback failed', error);
          return null;
        },
      );
      if (!finished) {
        context.session.flash(
          'error',
          'Could not sign in with GitHub. Please try again.',
        );
        return redirect(routes.auth.login.index.href());
      }

      const { account, profile } = finished.result;
      if (!profile.email) {
        context.session.flash(
          'error',
          'GitHub did not provide an email address.',
        );
        return redirect(routes.auth.login.index.href());
      }

      const result = await context.accountService.linkProviderAccount({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        email: profile.email,
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
      });
      if (!result.ok) {
        context.session.flash(
          'error',
          'Email already in use by an unverified account',
        );
        return redirect(routes.auth.login.index.href());
      }

      const userSession = await context.sessionService.createSession({
        userId: result.user.id,
      });
      const session = completeAuth(context);
      session.set('auth', userSession.id);

      session.flash('success', 'Signed in successfully!');
      return redirect(routes.discussions.index.href());
    },
  },
});

function getSocialProvider(name: string, origin: string) {
  if (isSocialProvider(name)) return providers[name](origin);
  throw new Response('Invalid Provider', { status: 400 });
}

function isSocialProvider(name: string): name is keyof typeof providers {
  return Object.hasOwn(providers, name);
}

const providers = {
  github(origin: string) {
    return createGitHubAuthProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      redirectUri: new URL(
        routes.auth.social.finish.href({ provider: 'github' }),
        origin,
      ),
    });
  },
};
