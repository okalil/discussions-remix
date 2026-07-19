import { css, type Handle } from 'remix/ui';

import { CommentRow, type CommentListItem } from './comment-row.tsx';

type CommentsProps = {
  comments: CommentListItem[];
};

export function Comments(handle: Handle<CommentsProps>) {
  return () => {
    const { comments } = handle.props;
    if (!comments.length) return null;

    return (
      <ul mix={styles.list}>
        {comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} />
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
};
