import { css, type Handle, type RemixNode } from 'remix/ui';

import { Layout } from '../layout.tsx';

type ProfileLayoutProps = {
  children?: RemixNode;
};

export function ProfileLayout(handle: Handle<ProfileLayoutProps>) {
  return () => (
    <Layout title="Profile">
      <main mix={styles.root}>
        <h1 mix={styles.title}>Profile</h1>
        {handle.props.children}
      </main>
    </Layout>
  );
}

const styles = {
  root: css({
    maxWidth: '32rem',
    margin: '0 auto',
    padding: '1.5rem 0.75rem',
  }),
  title: css({
    margin: '0 0 0.5rem',
    fontSize: '1.25rem',
    fontWeight: 600,
  }),
};
