import { css } from 'pitlane/theme';
import { type Handle, type RemixNode } from 'remix/component';

import { Layout } from '../../../shared/layout.tsx';
import { t } from '../../../theme.ts';

type NewDiscussionLayoutProps = {
  children?: RemixNode;
};

export function NewDiscussionLayout(handle: Handle<NewDiscussionLayoutProps>) {
  return () => (
    <Layout title="New Discussion">
      <main mix={styles.root}>
        <header mix={styles.header}>
          <h1 mix={styles.title}>Start a new discussion</h1>
          <p mix={styles.lede}>
            Ask a question, share an idea, or report a bug.
          </p>
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
