import { toDraft, toErrors } from '@discussions/form';
import { completeAuth } from 'remix/auth';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import {
  RegisterForm,
  registerSchema,
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
      const validation = parseSafe(registerSchema, context.formData);

      if (!validation.success) {
        return context.render(
          <RegisterLayout>
            <RegisterForm
              draft={toDraft(context.formData, {
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={toErrors(validation.issues)}
            />
          </RegisterLayout>,
          { status: 422 },
        );
      }

      const { value } = validation;

      if (await context.userService.getUserByEmail(value.email)) {
        return context.render(
          <RegisterLayout>
            <RegisterForm
              draft={toDraft(context.formData, {
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={{ email: 'Email already taken' }}
            />
          </RegisterLayout>,
          { status: 400 },
        );
      }

      const user = await context.accountService.createCredentialAccount(value);

      const userSession = await context.sessionService.createSession(user.id);
      const session = completeAuth(context);
      session.set('auth', userSession.id);

      session.flash('success', 'Signed up successfully!');
      return redirect(routes.discussions.index.href());
    },
  },
});
