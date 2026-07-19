import { type Handle } from 'remix/ui';

import { Document } from '../document.tsx';
import { AuthLayout } from './auth-layout.tsx';
import {
  ForgotPasswordForm,
  type ForgotPasswordFormProps,
} from './forgot-password-form.browser.tsx';

export function ForgotPasswordPage(handle: Handle<ForgotPasswordFormProps>) {
  return () => (
    <Document title="Forgot Password">
      <AuthLayout title="Forgot Password">
        <ForgotPasswordForm {...handle.props} />
      </AuthLayout>
    </Document>
  );
}
