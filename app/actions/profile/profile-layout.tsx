import { css } from 'pitlane/theme';
import { type Handle, type RemixNode } from 'remix/component';

import { Layout } from '../../shared/layout.tsx';
import { t } from '../../theme.ts';

type ProfileLayoutProps = {
  children?: RemixNode;
};

export function ProfileLayout(handle: Handle<ProfileLayoutProps>) {
  return () => (
    <Layout title="Profile">
      <main mix={styles.root}>
        <header mix={styles.header}>
          <h1 mix={styles.title}>Profile</h1>
          <p mix={styles.lede}>How you appear in discussions.</p>
        </header>
        {handle.props.children}
      </main>
    </Layout>
  );
}

const styles = {
  root: css({
    maxWidth: t.spacing(224),
    margin: [0, 'auto'],
    padding: [t.spacing(6), t.spacing(3)],
  }),
  header: css({
    marginBottom: t.spacing(6),
  }),
  title: css({
    margin: 0,
    fontSize: t.type.headlineSmall.size,
    fontWeight: t.type.titleMedium.weight,
  }),
  lede: css({
    margin: [t.spacing(1), 0, 0],
    color: t.color.onSurfaceVariant,
    fontSize: t.type.bodyMedium.size,
  }),
};
