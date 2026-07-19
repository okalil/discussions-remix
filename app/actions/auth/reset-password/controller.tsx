import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import { resetPasswordValidator } from '../../../ui/auth/reset-password-form.browser.tsx';
import { ResetPasswordPage } from '../../../ui/auth/reset-password-page.tsx';

export default createController(routes.auth.resetPassword, {
  actions: {
    async index({ render, url }) {
      const token = url.searchParams.get('token');
      return render(<ResetPasswordPage token={token} />);
    },
    async action(context) {
      const validation = resetPasswordValidator.validate(context.formData);

      if (validation.errors) {
        return context.render(
          <ResetPasswordPage
            draft={validation.getDraft({
              omit: ['password', 'passwordConfirmation'],
            })}
            errors={validation.errors}
          />,
          { status: 422 },
        );
      }

      const reset = await context.accountService.resetPassword(validation.data);
      if (!reset) {
        return context.render(
          <ResetPasswordPage
            draft={validation.getDraft({
              omit: ['password', 'passwordConfirmation'],
            })}
            errors={{ root: 'Invalid credentials' }}
          />,
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
