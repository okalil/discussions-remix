import { type Handle, type RemixNode } from 'remix/ui';

import { Document } from '../document.tsx';
import { AuthLayout } from './auth-layout.tsx';

type RegisterLayoutProps = {
  children?: RemixNode;
};

export function RegisterLayout(handle: Handle<RegisterLayoutProps>) {
  return () => (
    <Document title="Register">
      <AuthLayout title="Register">{handle.props.children}</AuthLayout>
    </Document>
  );
}
