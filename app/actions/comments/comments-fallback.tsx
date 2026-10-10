import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';

import { t } from '../../theme.ts';

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
    padding: [t.spacing(2), t.spacing(4)],
    marginBottom: t.spacing(5),
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
    borderRadius: t.shape.medium,
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: t.spacing(3),
  }),
  authorRow: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    width: t.spacing(8),
    height: t.spacing(8),
    marginRight: t.spacing(2),
    borderRadius: t.shape.full,
    backgroundColor: t.color.surfaceContainerHighest,
  }),
  meta: css({
    display: 'grid',
  }),
  metaLine: css({
    width: t.spacing(40),
    height: t.spacing(3.5),
  }),
  body: css({
    display: 'grid',
    gap: t.spacing(2),
    marginBottom: t.spacing(3),
  }),
  bodyLine: css({
    width: t.size.full,
    height: t.spacing(3.5),
  }),
  bodyLineShort: css({
    width: t.size.prose,
    height: t.spacing(3.5),
  }),
  vote: css({
    width: t.spacing(14),
    height: t.spacing(6),
    borderRadius: t.shape.small,
  }),
  bone: css({
    backgroundColor: t.color.surfaceContainerHighest,
    borderRadius: t.shape.extraSmall,
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    animation: 'pulse 1.5s ease-in-out infinite',
  }),
};
