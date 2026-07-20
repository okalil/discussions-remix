import { css, type Handle } from 'remix/ui';

type CommentsFallbackProps = {
  commentsCount: number;
};

export function CommentsFallback(handle: Handle<CommentsFallbackProps>) {
  return () => {
    if (!handle.props.commentsCount) {
      return null;
    }

    const count = Math.min(handle.props.commentsCount, 10);

    return (
      <ul mix={styles.list} aria-busy="true" aria-label="Loading comments">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} mix={styles.row}>
            <div mix={styles.header}>
              <div mix={styles.authorRow}>
                <div mix={styles.avatar} />
                <div mix={styles.meta}>
                  <div mix={[styles.bone, styles.metaLine]} />
                </div>
              </div>
            </div>
            <div mix={styles.body}>
              <div mix={[styles.bone, styles.bodyLine]} />
              <div mix={[styles.bone, styles.bodyLineShort]} />
            </div>
            <div mix={[styles.bone, styles.vote]} />
          </li>
        ))}
      </ul>
    );
  };
}

const styles = {
  list: css({
    display: 'grid',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  }),
  row: css({
    padding: '0.5rem 1rem',
    marginBottom: '1.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  }),
  authorRow: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    width: '2rem',
    height: '2rem',
    marginRight: '0.5rem',
    borderRadius: '9999px',
    backgroundColor: '#e5e7eb',
  }),
  meta: css({
    display: 'grid',
  }),
  metaLine: css({
    width: '10rem',
    height: '0.875rem',
  }),
  body: css({
    display: 'grid',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  }),
  bodyLine: css({
    width: '100%',
    height: '0.875rem',
  }),
  bodyLineShort: css({
    width: '70%',
    height: '0.875rem',
  }),
  vote: css({
    width: '3.5rem',
    height: '1.5rem',
    borderRadius: '0.75rem',
  }),
  bone: css({
    backgroundColor: '#e5e7eb',
    borderRadius: '0.25rem',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    animation: 'pulse 1.5s ease-in-out infinite',
  }),
};
