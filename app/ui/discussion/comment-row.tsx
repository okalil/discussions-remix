import { css, type Handle } from 'remix/ui';

import { Avatar } from '../shared/avatar.tsx';

export type CommentListItem = {
  id: number;
  body: string;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
  votesCount: number;
  voted: boolean;
  isDiscussionAuthor: boolean;
};

type CommentRowProps = {
  comment: CommentListItem;
};

export function CommentRow(handle: Handle<CommentRowProps>) {
  return () => {
    const { comment } = handle.props;
    return (
      <li id={`comment-${comment.id}`} mix={styles.row}>
        <div mix={styles.header}>
          <div mix={styles.authorRow}>
            <Avatar
              src={comment.author.image}
              alt={`${comment.author.name}'s avatar`}
              fallback={comment.author.name.at(0)}
              size={32}
              mix={styles.avatar}
            />
            <p mix={styles.meta}>
              <span mix={styles.authorName}>{comment.author.name}</span> on{' '}
              {new Date(comment.createdAt).toLocaleDateString('en', {
                dateStyle: 'medium',
              })}
            </p>
            {comment.isDiscussionAuthor && (
              <span mix={styles.authorBadge}>Author</span>
            )}
          </div>
        </div>

        <p mix={styles.body}>{comment.body}</p>
      </li>
    );
  };
}

const styles = {
  row: css({
    padding: '0.5rem 1rem',
    marginBottom: '1.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    '&:target': {
      borderColor: '#3b82f6',
    },
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
  }),
  authorRow: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    marginRight: '0.5rem',
  }),
  meta: css({
    margin: 0,
    color: '#6b7280',
  }),
  authorName: css({
    color: '#111827',
    fontWeight: 500,
  }),
  authorBadge: css({
    marginLeft: '0.5rem',
    padding: '1px 0.5rem',
    fontSize: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
  }),
  body: css({
    margin: '0 0 0.75rem',
    color: '#374151',
    whiteSpace: 'pre-wrap',
  }),
};
