import { completeAuth } from 'remix/auth';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import {
  LoginForm,
  loginValidator,
} from '../../../ui/auth/login-form.browser.tsx';
import { LoginLayout } from '../../../ui/auth/login-layout.tsx';

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
      const validation = loginValidator.validate(context.formData);
      if (validation.errors) {
        return context.render(
          <LoginLayout>
            <LoginForm
              draft={validation.getDraft({ omit: ['password'] })}
              errors={validation.errors}
            />
          </LoginLayout>,
          { status: 422 },
        );
      }

      const user = await context.accountService.getUserByCredentials(
        validation.data,
      );
      if (!user) {
        return context.render(
          <LoginLayout>
            <LoginForm
              draft={validation.getDraft({ omit: ['password'] })}
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
      return redirect(routes.discussions.index.href());
    },
  },
});
