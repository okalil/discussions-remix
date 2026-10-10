import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';

import type { DiscussionPreview } from '../../../core/discussion.types.ts';
import { routes } from '../../routes.ts';
import { Avatar } from '../../shared/avatar.tsx';
import { t } from '../../theme.ts';

type DiscussionPreviewCardProps = {
  discussion: DiscussionPreview;
};

export function DiscussionPreviewCard(
  handle: Handle<DiscussionPreviewCardProps>,
) {
  return () => {
    const { discussion } = handle.props;
    return (
      <div mix={styles.root}>
        <div mix={styles.section}>
          <div mix={styles.heading}>
            <p mix={styles.titleWrap}>
              <a
                href={routes.discussions.show.href({ id: discussion.id })}
                mix={styles.title}
              >
                {discussion.title}
              </a>
            </p>
            <span mix={styles.id}>#{discussion.id}</span>
          </div>
          <p mix={styles.body}>{discussion.content}</p>
        </div>

        {discussion.reply && (
          <div mix={styles.reply}>
            <div mix={styles.replyHeader}>
              <Avatar
                src={discussion.reply.author.avatar}
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
            <p mix={styles.replyBody}>{discussion.reply.content}</p>
          </div>
        )}
      </div>
    );
  };
}

const styles = {
  root: css({
    fontSize: t.type.bodyMedium.size,
  }),
  section: css({
    padding: t.spacing(3),
  }),
  heading: css({
    marginBottom: t.spacing(1),
  }),
  titleWrap: css({
    margin: 0,
  }),
  title: css({
    fontWeight: t.type.titleMedium.weight,
    color: t.color.onSurface,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  }),
  id: css({
    color: t.color.onSurfaceVariant,
  }),
  body: css({
    margin: 0,
    color: t.color.onSurfaceVariant,
  }),
  reply: css({
    borderTop: `${t.size.px} solid ${t.color.outlineVariant}`,
    padding: t.spacing(3),
  }),
  replyHeader: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: t.spacing(2),
  }),
  replyAvatar: css({
    marginRight: t.spacing(2),
  }),
  replyMeta: css({
    margin: 0,
    fontSize: t.type.bodySmall.size,
    color: t.color.onSurfaceVariant,
  }),
  replyAuthor: css({
    color: t.color.onSurface,
    fontWeight: t.type.labelLarge.weight,
  }),
  replyBody: css({
    margin: 0,
    fontSize: t.type.bodySmall.size,
    color: t.color.onSurfaceVariant,
  }),
};
