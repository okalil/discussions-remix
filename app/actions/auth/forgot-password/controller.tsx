import { toDraft, toErrors } from '@discussions/form';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
} from '../../../ui/auth/forgot-password-form.browser.tsx';
import { ForgotPasswordLayout } from '../../../ui/auth/forgot-password-layout.tsx';

export default createController(routes.auth.forgotPassword, {
  actions: {
    async index({ render }) {
      return render(
        <ForgotPasswordLayout>
          <ForgotPasswordForm />
        </ForgotPasswordLayout>,
      );
    },
    async action(context) {
      const validation = parseSafe(forgotPasswordSchema, context.formData);

      if (!validation.success) {
        return context.render(
          <ForgotPasswordLayout>
            <ForgotPasswordForm
              draft={toDraft(context.formData)}
              errors={toErrors(validation.issues)}
            />
          </ForgotPasswordLayout>,
          { status: 422 },
        );
      }

      const user = await context.userService.getUserByEmail(
        validation.value.email,
      );
      if (user?.email) {
        await context.accountService.forgetPassword(user.email);
      }

      context.session.flash(
        'success',
        'If your email is in our system, you will receive instructions to reset your password',
      );
      return redirect(routes.auth.login.index.href());
    },
  },
});
