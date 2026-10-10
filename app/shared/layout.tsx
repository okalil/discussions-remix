import { css } from 'pitlane/theme';
import { type Handle, type RemixNode } from 'remix/component';
import { getContext } from 'remix/middleware/async-context';

import { routes } from '../routes.ts';
import { Avatar } from '../shared/avatar.tsx';
import { button, Button } from '../shared/button.tsx';
import { t } from '../theme.ts';
import { Document, type DocumentProps } from './document.tsx';

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
            <a href={routes.discussions.index.href()} mix={styles.brand}>
              Discussions
            </a>

            {!user && (
              <div mix={styles.actions}>
                <a
                  href={routes.auth.login.index.href()}
                  mix={button({ variant: 'text' })}
                >
                  Login
                </a>
                <a
                  href={routes.auth.register.index.href()}
                  mix={button({ variant: 'primary' })}
                >
                  Sign Up
                </a>
              </div>
            )}

            {user && (
              <div mix={styles.actions}>
                <a href={routes.profile.index.href()} mix={styles.profile}>
                  <span aria-hidden="true">
                    <Avatar
                      src={user.avatar}
                      alt=""
                      size={32}
                      fallback={user.name?.charAt(0)}
                    />
                  </span>
                  {user.name && (
                    <span mix={styles.profileName}>{user.name}</span>
                  )}
                </a>
                <form method="post" action={routes.auth.logout.href()}>
                  <Button type="submit" variant="text">
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
    minHeight: t.size.screen,
    backgroundColor: t.color.surfaceContainerLow,
  }),
  header: css({
    backgroundColor: t.color.surface,
    color: t.color.onSurface,
    borderBottom: `${t.size.px} solid ${t.color.outline}`,
  }),
  headerInner: css({
    display: 'flex',
    alignItems: 'center',
    maxWidth: t.size.page,
    margin: [0, 'auto'],
    padding: [0, t.spacing(4)],
    height: t.spacing(14),
  }),
  brand: css({
    fontSize: t.type.titleMedium.size,
    fontWeight: t.type.titleMedium.weight,
    lineHeight: t.type.titleMedium.lineHeight,
    color: t.color.onSurface,
    textDecoration: 'none',
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(1),
    marginLeft: 'auto',
  }),
  profile: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(2),
    minWidth: 0,
    padding: [t.spacing(1), t.spacing(2)],
    borderRadius: t.shape.small,
    color: t.color.onSurface,
    textDecoration: 'none',
    fontSize: t.type.bodyMedium.size,
    fontWeight: t.type.labelLarge.weight,
    '&:hover': {
      backgroundColor: t.color.surfaceContainerLow,
    },
  }),
  profileName: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: t.spacing(40),
  }),
};
