import { css, type Handle, type RemixNode } from 'remix/ui';

import { Layout } from '../layout.tsx';

type NewDiscussionLayoutProps = {
  children?: RemixNode;
};

export function NewDiscussionLayout(handle: Handle<NewDiscussionLayoutProps>) {
  return () => (
    <Layout title="New Discussion">
      <main mix={styles.root}>
        <h1 mix={styles.title}>Start a new discussion</h1>
        {handle.props.children}
      </main>
    </Layout>
  );
}

const styles = {
  root: css({
    maxWidth: '56rem',
    margin: '0 auto',
    padding: '1.5rem 0.75rem',
  }),
  title: css({
    margin: '0 0 1rem',
    fontSize: '1.25rem',
    fontWeight: 600,
  }),
};
