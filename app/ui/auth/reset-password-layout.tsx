import { type Handle, type RemixNode } from 'remix/ui';

import { Document } from '../document.tsx';
import { AuthLayout } from './auth-layout.tsx';

type ResetPasswordLayoutProps = {
  children?: RemixNode;
};

export function ResetPasswordLayout(handle: Handle<ResetPasswordLayoutProps>) {
  return () => (
    <Document title="Reset Password">
      <AuthLayout title="Reset Password">{handle.props.children}</AuthLayout>
    </Document>
  );
}
