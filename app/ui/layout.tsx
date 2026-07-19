import { getContext } from 'remix/async-context-middleware';
import { css, type Handle, type RemixNode } from 'remix/ui';

import { routes } from '../routes.ts';
import { Document, type DocumentProps } from './document.tsx';
import { Avatar } from './shared/avatar.tsx';
import { Button } from './shared/button.browser.tsx';

export interface LayoutProps extends DocumentProps {
  children?: RemixNode;
}

export function Layout(handle: Handle<LayoutProps>) {
  const { auth } = getContext();
  const user = auth.ok ? auth.identity : null;

  const { children, ...documentProps } = handle.props;

  return () => (
    <Document {...documentProps}>
      <div mix={styles.root}>
        <header mix={styles.header}>
          <div mix={styles.headerInner}>
            <h1 mix={styles.brand}>
              <a href={routes.discussions.index.href()}>Discussions</a>
            </h1>

            {!user && (
              <div mix={styles.actions}>
                <form action={routes.auth.login.index.href()}>
                  <Button
                    type="submit"
                    variant="default"
                    mix={styles.headerButton}
                  >
                    Login
                  </Button>
                </form>
                <form action={routes.auth.register.index.href()}>
                  <Button
                    type="submit"
                    variant="default"
                    mix={styles.headerButton}
                  >
                    Sign Up
                  </Button>
                </form>
              </div>
            )}

            {user && (
              <div mix={styles.actions}>
                <a href={routes.profile.index.href()}>
                  <Avatar
                    src={user.image}
                    alt={user.name ?? ''}
                    size={32}
                    fallback={user.name?.charAt(0)}
                  />
                </a>
                <form method="post" action={routes.auth.logout.href()}>
                  <Button type="submit" variant="danger" aria-label="Log Out">
                    Log Out
                  </Button>
                </form>
              </div>
            )}
          </div>
        </header>

        {children}
      </div>
    </Document>
  );
}

const styles = {
  root: css({
    height: '100%',
  }),
  header: css({
    backgroundColor: '#111827',
    color: '#f9fafb',
  }),
  headerInner: css({
    display: 'flex',
    alignItems: 'center',
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '0.5rem 0.75rem',
    height: '3.5rem',
  }),
  brand: css({
    margin: 0,
    fontWeight: 500,
    fontSize: '1.25rem',
    '& a': {
      color: 'inherit',
      textDecoration: 'none',
    },
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginLeft: 'auto',
  }),
  headerButton: css({
    color: '#f9fafb',
    borderColor: '#4b5563',
    '&:hover:not(:disabled)': {
      backgroundColor: '#1f2937',
    },
  }),
};
