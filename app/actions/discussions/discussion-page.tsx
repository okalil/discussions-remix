import { css } from 'pitlane/theme';
import { Frame, type Handle } from 'remix/component';

import type { CommentSort } from '../../../core/comment.types.ts';
import type { Discussion } from '../../../core/discussion.types.ts';
import type { PublicUser } from '../../../core/user.types.ts';
import { routes } from '../../routes.ts';
import { Avatar } from '../../shared/avatar.tsx';
import { Layout } from '../../shared/layout.tsx';
import { t } from '../../theme.ts';
import { CommentsFallback } from '../comments/comments-fallback.tsx';
import { NewCommentForm } from '../comments/new-comment-form.tsx';
import { Participants } from './participants.tsx';
import { VoteDiscussion } from './vote-discussion.tsx';

type DiscussionPageProps = {
  discussion: Discussion;
  participants: PublicUser[];
  sort: CommentSort;
  authenticated: boolean;
};

export function DiscussionPage(handle: Handle<DiscussionPageProps>) {
  return () => {
    const { discussion, participants, sort, authenticated } = handle.props;

    const commentsHeading =
      discussion.commentsCount > 1
        ? `${discussion.commentsCount} comments`
        : discussion.commentsCount
          ? '1 comment'
          : 'No comments';

    const participantsHeading =
      discussion.participantsCount > 1
        ? `${discussion.participantsCount} participants`
        : '1 participant';

    return (
      <Layout title={discussion.title}>
        <div mix={styles.root}>
          <main>
            <header mix={styles.header}>
              <h1 mix={styles.title}>
                {discussion.title} <span mix={styles.id}>#{discussion.id}</span>
              </h1>
              <p mix={styles.lede}>
                <span mix={styles.emphasis}>{discussion.author.name}</span>{' '}
                started this conversation in{' '}
                <a
                  href={routes.discussions.index.href({
                    category: discussion.category.slug,
                  })}
                  mix={styles.ledeCategory}
                >
                  {discussion.category.title}
                </a>
              </p>
            </header>

            <div mix={styles.grid}>
              <div>
                <section mix={styles.card}>
                  <div mix={styles.authorRow}>
                    <Avatar
                      src={discussion.author.avatar}
                      alt={`${discussion.author.name}'s avatar`}
                      fallback={discussion.author.name.at(0)}
                      size={32}
                      mix={styles.avatar}
                    />
                    <p mix={styles.meta}>
                      <span mix={styles.authorName}>
                        {discussion.author.name}
                      </span>{' '}
                      on{' '}
                      {new Date(discussion.createdAt).toLocaleDateString('en', {
                        dateStyle: 'medium',
                      })}
                    </p>
                  </div>
                  <div mix={styles.body}>{discussion.content}</div>
                  <VoteDiscussion
                    id={discussion.id}
                    voted={discussion.voted}
                    votesCount={discussion.votesCount}
                    disabled={!authenticated}
                  />
                </section>

                <section mix={styles.commentsSection}>
                  <div mix={styles.commentsHeader}>
                    <h2 mix={styles.sectionTitle}>{commentsHeading}</h2>
                    <nav mix={styles.sortNav} aria-label="Sort comments">
                      <a
                        href="?sort=oldest"
                        mix={[
                          styles.sortLink,
                          sort === 'oldest' && styles.sortLinkActive,
                        ]}
                      >
                        Oldest
                      </a>
                      <a
                        href="?sort=newest"
                        mix={[
                          styles.sortLink,
                          sort === 'newest' && styles.sortLinkActive,
                        ]}
                      >
                        Newest
                      </a>
                      <a
                        href="?sort=top"
                        mix={[
                          styles.sortLink,
                          sort === 'top' && styles.sortLinkActive,
                        ]}
                      >
                        Top
                      </a>
                    </nav>
                  </div>
                  <Frame
                    src={routes.comments.index.href(
                      { discussionId: discussion.id },
                      { searchParams: { sort } },
                    )}
                    fallback={
                      <CommentsFallback
                        commentsCount={discussion.commentsCount}
                      />
                    }
                  />
                </section>

                {authenticated ? (
                  <section>
                    <h2 mix={styles.addCommentHeading}>Add a comment</h2>
                    <NewCommentForm discussionId={discussion.id} />
                  </section>
                ) : (
                  <div mix={styles.signInPrompt}>
                    <a
                      href={routes.auth.register.index.href()}
                      mix={styles.link}
                    >
                      Sign up
                    </a>{' '}
                    now to comment on this discussion. Already have an account?{' '}
                    <a href={routes.auth.login.index.href()} mix={styles.link}>
                      Sign in
                    </a>
                  </div>
                )}
              </div>

              <aside>
                <div mix={styles.asideSticky}>
                  <div mix={styles.asideSection}>
                    <h3 mix={styles.asideHeading}>Category</h3>
                    <a
                      href={routes.discussions.index.href({
                        category: discussion.category.slug,
                      })}
                      mix={styles.categoryLink}
                    >
                      <div mix={styles.categoryEmoji}>
                        {discussion.category.emoji}
                      </div>
                      <span mix={styles.categoryTitle}>
                        {discussion.category.title}
                      </span>
                    </a>
                  </div>

                  <div mix={styles.asideSection}>
                    <h3 mix={styles.asideHeading}>{participantsHeading}</h3>
                    <Participants participants={participants} />
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </Layout>
    );
  };
}

const styles = {
  root: css({
    maxWidth: t.size.page,
    margin: [0, 'auto'],
    padding: [t.spacing(6), t.spacing(3)],
  }),
  header: css({
    marginBottom: t.spacing(6),
  }),
  title: css({
    margin: 0,
    fontSize: t.type.headlineSmall.size,
    fontWeight: t.type.titleMedium.weight,
  }),
  id: css({
    marginLeft: t.spacing(1),
    color: t.color.onSurfaceVariant,
    fontWeight: t.type.bodyLarge.weight,
  }),
  grid: css({
    display: 'grid',
    gap: t.spacing(6),
    position: 'relative',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: `1fr ${t.spacing(64)}`,
    },
  }),
  lede: css({
    margin: [t.spacing(2), 0, 0],
    color: t.color.onSurfaceVariant,
    fontSize: t.type.bodyMedium.size,
  }),
  emphasis: css({
    color: t.color.onSurface,
    fontWeight: t.type.labelLarge.weight,
  }),
  ledeCategory: css({
    color: t.color.onSurface,
    fontWeight: t.type.labelLarge.weight,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  }),
  authorRow: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: t.spacing(4),
    fontSize: t.type.bodyMedium.size,
  }),
  avatar: css({
    marginRight: t.spacing(2),
  }),
  meta: css({
    margin: 0,
    color: t.color.onSurfaceVariant,
  }),
  authorName: css({
    color: t.color.onSurface,
    fontWeight: t.type.labelLarge.weight,
  }),
  card: css({
    padding: t.spacing(5),
    marginBottom: t.spacing(6),
    backgroundColor: t.color.surface,
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
    borderRadius: t.shape.medium,
  }),
  body: css({
    marginBottom: t.spacing(4),
    whiteSpace: 'pre-wrap',
  }),
  commentsSection: css({
    marginBottom: t.spacing(6),
  }),
  commentsHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: t.spacing(4),
  }),
  sectionTitle: css({
    margin: 0,
    fontSize: t.type.titleMedium.size,
    fontWeight: t.type.titleMedium.weight,
  }),
  sortNav: css({
    display: 'flex',
    gap: t.spacing(2),
  }),
  sortLink: css({
    padding: [t.spacing(1), t.spacing(3)],
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
    textDecoration: 'none',
    borderRadius: t.shape.small,
    '&:hover': {
      backgroundColor: t.color.surfaceContainer,
    },
  }),
  sortLinkActive: css({
    backgroundColor: t.color.surfaceContainerHigh,
    color: t.color.onSurface,
  }),
  addCommentHeading: css({
    margin: [0, 0, t.spacing(4)],
    fontSize: t.type.titleMedium.size,
    fontWeight: t.type.titleMedium.weight,
  }),
  signInPrompt: css({
    padding: t.spacing(3),
    backgroundColor: t.color.surface,
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
    borderRadius: t.shape.medium,
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'underline',
  }),
  asideSticky: css({
    position: 'sticky',
    top: t.spacing(6),
  }),
  asideSection: css({
    paddingBottom: t.spacing(4),
    marginBottom: t.spacing(4),
    borderBottom: `${t.size.px} solid ${t.color.outlineVariant}`,
  }),
  asideHeading: css({
    margin: [0, 0, t.spacing(2)],
    fontSize: t.type.labelMedium.size,
    fontWeight: t.type.labelMedium.weight,
    color: t.color.onSurface,
  }),
  categoryLink: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(2),
    width: 'max-content',
    color: 'inherit',
    textDecoration: 'none',
    '&:hover span': {
      textDecoration: 'underline',
    },
  }),
  categoryEmoji: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: t.spacing(8),
    height: t.spacing(8),
    fontSize: t.type.titleMedium.size,
    backgroundColor: t.color.surfaceContainer,
    borderRadius: t.shape.small,
  }),
  categoryTitle: css({
    fontSize: t.type.bodyMedium.size,
    fontWeight: t.type.titleMedium.weight,
  }),
};
