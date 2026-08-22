import { toDraft, toErrors } from '@discussions/form';
import { createController } from '@discussions/router';
import { completeAuth } from 'remix/auth';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';

import { rememberCookie } from '../../middleware/auth.ts';
import { routes } from '../../routes.ts';
import { LoginForm, loginSchema } from './login-form.tsx';
import { LoginLayout } from './login-layout.tsx';

export default createController(routes.auth.login, {
  actions: {
    async index({ render }) {
      return render(
        <LoginLayout>
          <LoginForm />
        </LoginLayout>,
      );
    },
    async action(context) {
      const validation = parseSafe(loginSchema, context.formData);
      if (!validation.success) {
        return context.render(
          <LoginLayout>
            <LoginForm
              draft={toDraft(context.formData, { omit: ['password'] })}
              errors={toErrors(validation.issues)}
            />
          </LoginLayout>,
          { status: 422 },
        );
      }

      const { email, password, remember } = validation.value;
      const user = await context.accountService.getUserByCredentials({
        email,
        password,
      });
      if (!user) {
        return context.render(
          <LoginLayout>
            <LoginForm
              draft={toDraft(context.formData, { omit: ['password'] })}
              errors={{ root: 'Invalid email or password' }}
            />
          </LoginLayout>,
          { status: 400 },
        );
      }

      const userSession = await context.sessionService.createSession(user.id);
      const session = completeAuth(context);
      session.set('auth', userSession.id);

      session.flash('success', 'Signed in successfully!');
      return redirect(routes.discussions.index.href(), {
        headers: {
          'Set-Cookie': remember
            ? await rememberCookie.serialize(userSession.id, {
                expires: new Date(userSession.expires),
              })
            : await rememberCookie.serialize('', { maxAge: 0 }),
        },
      });
    },
  },
});
