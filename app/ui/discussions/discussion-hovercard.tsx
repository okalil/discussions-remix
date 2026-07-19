import { css, type Handle } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Avatar } from '../shared/avatar.tsx';

type DiscussionHovercardProps = {
  discussion: {
    id: number;
    title: string;
    body: string;
    reply?: {
      body: string;
      author: {
        name: string;
        image: string | null;
      };
    };
  };
};

export function DiscussionHovercard(handle: Handle<DiscussionHovercardProps>) {
  return () => {
    const { discussion } = handle.props;
    return (
      <div mix={styles.root}>
        <div mix={styles.section}>
          <div mix={styles.heading}>
            <p mix={styles.titleWrap}>
              <a
                href={routes.discussions.show.index.href({ id: discussion.id })}
                mix={styles.title}
              >
                {discussion.title}
              </a>
            </p>
            <span mix={styles.id}>#{discussion.id}</span>
          </div>
          <p mix={styles.body}>{discussion.body}</p>
        </div>

        {discussion.reply && (
          <div mix={styles.reply}>
            <div mix={styles.replyHeader}>
              <Avatar
                src={discussion.reply.author.image}
                alt={`${discussion.reply.author.name}'s avatar`}
                fallback={discussion.reply.author.name.at(0)}
                size={20}
                mix={styles.replyAvatar}
              />
              <p mix={styles.replyMeta}>
                <span mix={styles.replyAuthor}>
                  {discussion.reply.author.name}
                </span>{' '}
                replied
              </p>
            </div>
            <p mix={styles.replyBody}>{discussion.reply.body}</p>
          </div>
        )}
      </div>
    );
  };
}

const styles = {
  root: css({
    fontSize: '0.875rem',
  }),
  section: css({
    padding: '0.75rem',
  }),
  heading: css({
    marginBottom: '0.25rem',
  }),
  titleWrap: css({
    margin: 0,
  }),
  title: css({
    fontWeight: 600,
    color: '#111827',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  }),
  id: css({
    color: '#4b5563',
  }),
  body: css({
    margin: 0,
    color: '#4b5563',
  }),
  reply: css({
    borderTop: '1px solid #e5e7eb',
    padding: '0.75rem',
  }),
  replyHeader: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  }),
  replyAvatar: css({
    marginRight: '0.5rem',
  }),
  replyMeta: css({
    margin: 0,
    fontSize: '0.75rem',
    color: '#6b7280',
  }),
  replyAuthor: css({
    color: '#111827',
    fontWeight: 500,
  }),
  replyBody: css({
    margin: 0,
    fontSize: '0.75rem',
    color: '#374151',
  }),
};
