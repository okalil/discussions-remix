import { css, type Handle, type RemixNode } from 'remix/ui';

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
    minHeight: '100%',
    backgroundColor: '#f3f4f6',
  }),
  card: css({
    width: '100%',
    maxWidth: '28rem',
    padding: '2rem',
    display: 'grid',
    gap: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '0.25rem',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  }),
  title: css({
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    textAlign: 'center',
  }),
};
