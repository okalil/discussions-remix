import { type Handle } from 'remix/ui';

import { Document } from '../document.tsx';
import { AuthLayout } from './auth-layout.tsx';
import {
  ResetPasswordForm,
  type ResetPasswordFormProps,
} from './reset-password-form.browser.tsx';

export function ResetPasswordPage(handle: Handle<ResetPasswordFormProps>) {
  return () => (
    <Document title="Reset Password">
      <AuthLayout title="Reset Password">
        <ResetPasswordForm {...handle.props} />
      </AuthLayout>
    </Document>
  );
}
