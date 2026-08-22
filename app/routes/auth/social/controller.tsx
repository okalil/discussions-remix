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
        context.request,
      );
      return startExternalAuth(provider, context);
    },
    async finish(context) {
      const provider = getSocialProvider(
        context.params.provider,
        context.request,
      );

      const { result } = await finishExternalAuth(provider, context).catch(
        (error) => {
          console.error('OAuth callback failed', error);
          throw new Response('Invalid OAuth callback', { status: 400 });
        },
      );

      const { account, profile } = result;
      if (!profile.email) {
        throw new Response('Email not found', { status: 400 });
      }

      const user = await context.accountService.linkProviderAccount({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        email: profile.email,
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
      });

      const userSession = await context.sessionService.createSession(user.id);
      const session = completeAuth(context);
      session.set('auth', userSession.id);

      session.flash('success', 'Signed in successfully!');
      return redirect(routes.discussions.index.href());
    },
  },
});

function getSocialProvider(name: string, request: Request) {
  if (isSocialProvider(name)) return providers[name](request);
  throw new Response('Invalid Provider', { status: 400 });
}

function isSocialProvider(name: string): name is keyof typeof providers {
  return Object.hasOwn(providers, name);
}

const providers = {
  github: (request: Request) =>
    createGitHubAuthProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      redirectUri: new URL(
        routes.auth.social.finish.href({ provider: 'github' }),
        request.url,
      ),
    }),
};
