import { completeAuth } from 'remix/auth';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import { loginValidator } from '../../../ui/auth/login-form.browser.tsx';
import { LoginPage } from '../../../ui/auth/login-page.tsx';

export default createController(routes.auth.login, {
  actions: {
    async index({ render }) {
      return render(<LoginPage />);
    },
    async action(context) {
      const validation = loginValidator.validate(context.formData);
      if (validation.errors) {
        return context.render(
          <LoginPage
            draft={validation.getDraft({ omit: ['password'] })}
            errors={validation.errors}
          />,
          { status: 422 },
        );
      }

      const user = await context.accountService.getUserByCredentials(
        validation.data,
      );
      if (!user) {
        return context.render(
          <LoginPage
            draft={validation.getDraft({ omit: ['password'] })}
            errors={{ root: 'Invalid email or password' }}
          />,
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
