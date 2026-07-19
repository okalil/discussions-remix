import { css, type Handle, type RemixNode } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Document } from '../document.tsx';
import { Button } from '../shared/button.browser.tsx';
import { Icon } from '../shared/icon.browser.tsx';
import { AuthLayout } from './auth-layout.tsx';

type LoginLayoutProps = {
  children?: RemixNode;
};

export function LoginLayout(handle: Handle<LoginLayoutProps>) {
  return () => (
    <Document title="Login">
      <AuthLayout title="Login">
        <div>
          <form
            method="post"
            action={routes.auth.social.start.href({ provider: 'github' })}
          >
            <Button variant="primary" mix={styles.githubButton}>
              <Icon name="github" size={20} />
              Continue with Github
            </Button>
          </form>

          <div mix={styles.divider}>
            <hr />
            <span mix={styles.dividerLabel}>or</span>
          </div>

          {handle.props.children}
        </div>
      </AuthLayout>
    </Document>
  );
}

const styles = {
  githubButton: css({
    gap: '0.5rem',
    height: '3rem',
    width: '100%',
  }),
  divider: css({
    position: 'relative',
    margin: '1.5rem 0',
  }),
  dividerLabel: css({
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '0 1rem',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '0.875rem',
  }),
};
