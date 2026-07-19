import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';
import { type Handle } from 'remix/ui';

import { routes } from '../../../routes.ts';
import {
  ForgotPasswordForm,
  forgotPasswordValidator,
  type ForgotPasswordFormProps,
} from '../../../ui/auth/forgot-password.browser.tsx';
import { AuthLayout } from '../../../ui/auth/layout.tsx';
import { Document } from '../../../ui/document.tsx';

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

function ForgotPasswordPage(handle: Handle<ForgotPasswordFormProps>) {
  return () => (
    <Document title="Forgot Password">
      <AuthLayout title="Forgot Password">
        <ForgotPasswordForm {...handle.props} />
      </AuthLayout>
    </Document>
  );
}
