import { type Handle, type RemixNode } from 'remix/ui';

import { Document } from '../document.tsx';
import { AuthLayout } from './auth-layout.tsx';

type ForgotPasswordLayoutProps = {
  children?: RemixNode;
};

export function ForgotPasswordLayout(
  handle: Handle<ForgotPasswordLayoutProps>,
) {
  return () => (
    <Document title="Forgot Password">
      <AuthLayout title="Forgot Password">{handle.props.children}</AuthLayout>
    </Document>
  );
}
