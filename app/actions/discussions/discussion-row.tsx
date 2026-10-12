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
        <div mix={styles.vote}>
          <VoteDiscussion
            id={discussion.id}
            voted={discussion.voted}
            votesCount={discussion.votesCount}
            disabled={!authenticated}
          />
        </div>

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
          size={28}
          mix={styles.avatar}
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
    gridTemplateColumns: `${t.spacing(12)} auto ${t.spacing(15)} minmax(0, 1fr)`,
    columnGap: t.spacing(5),
    rowGap: t.spacing(2),
    alignItems: 'center',
    padding: [t.spacing(2), t.spacing(4)],
    borderBottom: `${t.size.px} solid ${t.color.outlineVariant}`,
    '&:hover': {
      backgroundColor: t.color.surfaceContainer,
    },
    '@media (min-width: 768px)': {
      gridTemplateColumns: `${t.spacing(12)} 1fr auto ${t.spacing(15)}`,
      rowGap: t.spacing(5),
    },
  }),
  vote: css({
    gridColumn: '1',
    gridRow: '1 / span 2',
    '@media (min-width: 768px)': {
      gridColumn: 'auto',
      gridRow: 'auto',
    },
  }),
  content: css({
    minWidth: 0,
    gridColumn: '2 / -1',
    gridRow: '1',
    '@media (min-width: 768px)': {
      gridColumn: 'auto',
      gridRow: 'auto',
    },
  }),
  avatar: css({
    gridColumn: '2',
    gridRow: '2',
    '@media (min-width: 768px)': {
      gridColumn: 'auto',
      gridRow: 'auto',
    },
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
    gridColumn: '3',
    gridRow: '2',
    marginLeft: 'auto',
    padding: [t.spacing(1), t.spacing(2)],
    color: t.color.onSurfaceVariant,
    textDecoration: 'none',
    borderRadius: t.shape.small,
    '&:hover': {
      color: t.color.primary,
    },
    '@media (min-width: 768px)': {
      gridColumn: 'auto',
      gridRow: 'auto',
    },
  }),
};
