import { type Handle } from 'remix/ui';

import { Document } from '../document.tsx';
import { AuthLayout } from './auth-layout.tsx';
import {
  RegisterForm,
  type RegisterFormProps,
} from './register-form.browser.tsx';

export function RegisterPage(handle: Handle<RegisterFormProps>) {
  return () => (
    <Document title="Register">
      <AuthLayout title="Register">
        <RegisterForm {...handle.props} />
      </AuthLayout>
    </Document>
  );
}
