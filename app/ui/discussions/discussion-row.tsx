import { css, type Handle } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Avatar } from '../shared/avatar.browser.tsx';
import { Icon } from '../shared/icon.browser.tsx';
import { DiscussionLink } from './discussion-link.browser.tsx';
import { VoteDiscussion } from './vote-discussion.browser.tsx';

export type DiscussionListItem = {
  id: number;
  title: string;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
  commentsCount: number;
  votesCount: number;
  voted: boolean;
};

type DiscussionRowProps = {
  discussion: DiscussionListItem;
  authenticated: boolean;
};

export function DiscussionRow(handle: Handle<DiscussionRowProps>) {
  return () => {
    const { discussion, authenticated } = handle.props;

    return (
      <li mix={styles.row}>
        <VoteDiscussion
          id={discussion.id}
          voted={discussion.voted}
          votesCount={discussion.votesCount}
          disabled={!authenticated}
        />

        <div mix={styles.content}>
          <DiscussionLink
            href={routes.discussions.show.href({ id: discussion.id })}
            previewHref={routes.discussions.frames.preview.href({
              id: discussion.id,
            })}
          >
            {discussion.title}
          </DiscussionLink>
          <p mix={styles.meta}>
            {discussion.author.name} started on{' '}
            {new Date(discussion.createdAt).toLocaleDateString('en', {
              dateStyle: 'medium',
            })}
          </p>
        </div>

        <Avatar
          src={discussion.author.image}
          alt={`${discussion.author.name}'s avatar`}
          fallback={discussion.author.name.at(0)}
          size={36}
        />

        <a
          href={routes.discussions.show.href({ id: discussion.id })}
          aria-label={`${discussion.commentsCount} comments`}
          mix={styles.comments}
        >
          <Icon name="chat" size={16} />
          {discussion.commentsCount}
        </a>
      </li>
    );
  };
}

const styles = {
  row: css({
    display: 'grid',
    gridTemplateColumns: '60px 1fr auto 60px',
    gap: '1.25rem',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #e5e7eb',
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  }),
  content: css({
    minWidth: 0,
  }),
  meta: css({
    margin: '0.125rem 0 0',
    fontSize: '0.875rem',
    color: '#4b5563',
  }),
  comments: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginLeft: 'auto',
    padding: '0.25rem 0.5rem',
    color: '#4b5563',
    textDecoration: 'none',
    borderRadius: '0.75rem',
    '&:hover': {
      color: '#2563eb',
    },
  }),
};
