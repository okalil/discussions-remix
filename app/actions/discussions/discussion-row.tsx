import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';

import type { DiscussionSummary } from '../../../core/discussion.types.ts';
import { routes } from '../../routes.ts';
import { Avatar } from '../../shared/avatar.tsx';
import { ChatIcon } from '../../shared/icons/chat-icon.tsx';
import { t } from '../../theme.ts';
import { DiscussionLink } from './discussion-link.tsx';
import { VoteDiscussion } from './vote-discussion.tsx';

type DiscussionRowProps = {
  discussion: DiscussionSummary;
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
            previewHref={routes.discussions.preview.href({
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
          src={discussion.author.avatar}
          alt={`${discussion.author.name}'s avatar`}
          fallback={discussion.author.name.at(0)}
          size={36}
        />

        <a
          href={routes.discussions.show.href({ id: discussion.id })}
          aria-label={`${discussion.commentsCount} comments`}
          mix={styles.comments}
        >
          <ChatIcon size={16} />
          {discussion.commentsCount}
        </a>
      </li>
    );
  };
}

const styles = {
  row: css({
    display: 'grid',
    gridTemplateColumns: `${t.spacing(12)} 1fr auto ${t.spacing(15)}`,
    gap: t.spacing(5),
    alignItems: 'center',
    padding: [t.spacing(2), t.spacing(4)],
    borderBottom: `${t.size.px} solid ${t.color.outlineVariant}`,
    '&:hover': {
      backgroundColor: t.color.surfaceContainer,
    },
  }),
  content: css({
    minWidth: 0,
  }),
  meta: css({
    margin: [t.spacing(0.5), 0, 0],
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
  }),
  comments: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(2),
    marginLeft: 'auto',
    padding: [t.spacing(1), t.spacing(2)],
    color: t.color.onSurfaceVariant,
    textDecoration: 'none',
    borderRadius: t.shape.small,
    '&:hover': {
      color: t.color.primary,
    },
  }),
};
