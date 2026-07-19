import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../../routes.ts';
import { forgotPasswordValidator } from '../../../ui/auth/forgot-password-form.browser.tsx';
import { ForgotPasswordPage } from '../../../ui/auth/forgot-password-page.tsx';

export default createController(routes.auth.forgotPassword, {
  actions: {
    async index({ render }) {
      return render(<ForgotPasswordPage />);
    },
    async action(context) {
      const validation = forgotPasswordValidator.validate(context.formData);

      if (validation.errors) {
        return context.render(
          <ForgotPasswordPage
            draft={validation.getDraft()}
            errors={validation.errors}
          />,
          { status: 422 },
        );
      }

      const user = await context.userService.getUserByEmail(
        validation.data.email,
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
