import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';

import type { Comment } from '../../../core/comment.types.ts';
import { CommentRow } from './comment-row.tsx';

type CommentsProps = {
  comments: Comment[];
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
