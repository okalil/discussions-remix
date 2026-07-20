import { css, type Handle } from 'remix/ui';

import { CommentRow, type CommentListItem } from './comment-row.browser.tsx';

type CommentsProps = {
  comments: CommentListItem[];
  authenticated: boolean;
};

export function Comments(handle: Handle<CommentsProps>) {
  return () => {
    const { comments, authenticated } = handle.props;
    if (!comments.length) return null;

    return (
      <ul mix={styles.list}>
        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            authenticated={authenticated}
          />
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
