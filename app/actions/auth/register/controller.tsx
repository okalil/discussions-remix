import { completeAuth } from 'remix/auth';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import {
  RegisterForm,
  registerValidator,
} from '../../../ui/auth/register-form.browser.tsx';
import { RegisterLayout } from '../../../ui/auth/register-layout.tsx';

export default createController(routes.auth.register, {
  actions: {
    async index({ render }) {
      return render(
        <RegisterLayout>
          <RegisterForm />
        </RegisterLayout>,
      );
    },
    async action(context) {
      const validation = registerValidator.validate(context.formData);

      if (validation.errors) {
        return context.render(
          <RegisterLayout>
            <RegisterForm
              draft={validation.getDraft({
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={validation.errors}
            />
          </RegisterLayout>,
          { status: 422 },
        );
      }

      const { data } = validation;

      if (await context.userService.getUserByEmail(data.email)) {
        return context.render(
          <RegisterLayout>
            <RegisterForm
              draft={validation.getDraft({
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={{ email: 'Email already taken' }}
            />
          </RegisterLayout>,
          { status: 400 },
        );
      }

      const user = await context.accountService.createCredentialAccount(data);

      const userSession = await context.sessionService.createSession(user.id);
      const session = completeAuth(context);
      session.set('auth', userSession.id);

      session.flash('success', 'Signed up successfully!');
      return redirect(routes.discussions.index.href());
    },
  },
});
