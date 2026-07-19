import { completeAuth } from 'remix/auth';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';
import { type Handle } from 'remix/ui';

import { routes } from '../../../routes.ts';
import { AuthLayout } from '../../../ui/auth/layout.tsx';
import {
  RegisterForm,
  registerValidator,
  type RegisterFormProps,
} from '../../../ui/auth/register.browser.tsx';
import { Document } from '../../../ui/document.tsx';

export default createController(routes.auth.register, {
  actions: {
    async index({ render }) {
      return render(<RegisterPage />);
    },
    async action(context) {
      const validation = registerValidator.validate(context.formData);

      if (validation.errors) {
        return context.render(
          <RegisterPage
            draft={validation.getDraft({
              omit: ['password', 'passwordConfirmation'],
            })}
            errors={validation.errors}
          />,
          { status: 422 },
        );
      }

      const { data } = validation;

      if (await context.userService.getUserByEmail(data.email)) {
        return context.render(
          <RegisterPage
            draft={validation.getDraft({
              omit: ['password', 'passwordConfirmation'],
            })}
            errors={{ email: 'Email already taken' }}
          />,
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

function RegisterPage(handle: Handle<RegisterFormProps>) {
  return () => (
    <Document title="Register">
      <AuthLayout title="Register">
        <RegisterForm {...handle.props} />
      </AuthLayout>
    </Document>
  );
}
