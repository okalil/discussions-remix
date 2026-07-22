import { toDraft, toErrors } from '@discussions/form';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import {
  ResetPasswordForm,
  resetPasswordSchema,
} from '../../../ui/auth/reset-password-form.browser.tsx';
import { ResetPasswordLayout } from '../../../ui/auth/reset-password-layout.tsx';

export default createController(routes.auth.resetPassword, {
  actions: {
    async index({ render, url }) {
      const token = url.searchParams.get('token');
      return render(
        <ResetPasswordLayout>
          <ResetPasswordForm token={token} />
        </ResetPasswordLayout>,
      );
    },
    async action(context) {
      const validation = parseSafe(resetPasswordSchema, context.formData);

      if (!validation.success) {
        return context.render(
          <ResetPasswordLayout>
            <ResetPasswordForm
              draft={toDraft(context.formData, {
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={toErrors(validation.issues)}
            />
          </ResetPasswordLayout>,
          { status: 422 },
        );
      }

      const reset = await context.accountService.resetPassword(
        validation.value,
      );
      if (!reset) {
        return context.render(
          <ResetPasswordLayout>
            <ResetPasswordForm
              draft={toDraft(context.formData, {
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={{ root: 'Invalid credentials' }}
            />
          </ResetPasswordLayout>,
          { status: 400 },
        );
      }

      context.session.flash(
        'success',
        'Password succesfully reset! Login to access your account.',
      );
      return redirect(routes.auth.login.index.href());
    },
  },
});
