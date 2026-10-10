import { css } from 'pitlane/theme';
import { type Handle, type RemixNode } from 'remix/component';

import { t } from '../../theme.ts';

type AuthLayoutProps = {
  title: string;
  children?: RemixNode;
};

export function AuthLayout(handle: Handle<AuthLayoutProps>) {
  return () => (
    <div mix={styles.root}>
      <div mix={styles.card}>
        <h2 mix={styles.title}>{handle.props.title}</h2>
        {handle.props.children}
      </div>
    </div>
  );
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: t.size.screen,
    backgroundColor: t.color.surfaceContainer,
  }),
  card: css({
    width: t.size.full,
    maxWidth: t.spacing(112),
    padding: t.spacing(8),
    display: 'grid',
    gap: t.spacing(6),
    backgroundColor: t.color.surfaceContainerLowest,
    borderRadius: t.shape.medium,
    boxShadow: t.elevation.level1,
  }),
  title: css({
    margin: 0,
    fontSize: t.type.headlineSmall.size,
    fontWeight: t.type.titleMedium.weight,
    textAlign: 'center',
  }),
};
