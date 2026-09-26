import { toDraft, toErrors } from '@discussions/form';
import { createController } from '@discussions/router';
import { parseSafe } from 'remix/data-schema';
import { redirect } from 'remix/response/redirect';

import { routes } from '../../../routes.ts';
import {
  ResetPasswordForm,
  resetPasswordSchema,
} from './reset-password-form.tsx';
import { ResetPasswordLayout } from './reset-password-layout.tsx';

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
      const parsed = parseSafe(resetPasswordSchema, context.formData);
      if (!parsed.success) {
        return context.render(
          <ResetPasswordLayout>
            <ResetPasswordForm
              draft={toDraft(context.formData, {
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={toErrors(parsed.issues)}
            />
          </ResetPasswordLayout>,
          { status: 422 },
        );
      }

      const result = await context.accountService.resetPassword(parsed.value);
      if (!result.ok) {
        return context.render(
          <ResetPasswordLayout>
            <ResetPasswordForm
              draft={toDraft(context.formData, {
                omit: ['password', 'passwordConfirmation'],
              })}
              errors={{
                root: 'Invalid or expired token',
              }}
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
