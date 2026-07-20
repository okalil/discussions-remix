import { css, Frame, type Handle } from 'remix/ui';

import { routes } from '../../routes.ts';
import { VoteDiscussion } from '../discussions/vote-discussion.browser.tsx';
import { Layout } from '../layout.tsx';
import { Avatar } from '../shared/avatar.browser.tsx';
import { CommentsFallback } from './comments-fallback.tsx';
import { NewCommentForm } from './new-comment-form.browser.tsx';
import { Participants, type Participant } from './participants.tsx';

type DiscussionPageProps = {
  discussion: {
    id: number;
    title: string;
    body: string;
    createdAt: string;
    author: {
      name: string;
      image: string | null;
    };
    category: {
      emoji: string;
      title: string;
      slug: string;
    };
    votesCount: number;
    commentsCount: number;
    participantsCount: number;
    voted: boolean;
  };
  participants: Participant[];
  sort: string;
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
            <h1 mix={styles.title}>
              {discussion.title} <span mix={styles.id}>#{discussion.id}</span>
            </h1>

            <div mix={styles.grid}>
              <div>
                <section mix={styles.card}>
                  <div mix={styles.authorRow}>
                    <Avatar
                      src={discussion.author.image}
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
                  <div mix={styles.body}>{discussion.body}</div>
                  <VoteDiscussion
                    action={routes.discussions.vote.href({
                      id: discussion.id,
                    })}
                    voted={discussion.voted}
                    votesCount={discussion.votesCount}
                    disabled={!authenticated}
                  />
                </section>

                <section mix={styles.commentsSection}>
                  <div mix={styles.commentsHeader}>
                    <h2 mix={styles.commentsTitle}>{commentsHeading}</h2>
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
                    src={routes.discussions.frames.comments.href(
                      { id: discussion.id },
                      { sort },
                    )}
                    fallback={
                      <CommentsFallback
                        commentsCount={discussion.commentsCount}
                      />
                    }
                  />
                  <hr mix={styles.divider} />
                </section>

                {authenticated ? (
                  <section>
                    <h3 mix={styles.addCommentHeading}>Add a comment</h3>
                    <NewCommentForm
                      action={routes.comments.new.href({
                        discussionId: discussion.id,
                      })}
                    />
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
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '1.5rem 0.75rem',
  }),
  title: css({
    margin: '0 0 1rem',
    fontSize: '1.5rem',
    fontWeight: 500,
  }),
  id: css({
    marginLeft: '0.25rem',
    color: '#6b7280',
    fontWeight: 400,
  }),
  grid: css({
    display: 'grid',
    gap: '1.5rem',
    position: 'relative',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '1fr 16rem',
    },
  }),
  card: css({
    padding: '0.5rem 0.75rem 0.75rem',
    marginBottom: '1.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
  }),
  authorRow: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    fontSize: '0.875rem',
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
  body: css({
    marginBottom: '0.5rem',
    whiteSpace: 'pre-wrap',
  }),
  commentsSection: css({
    marginBottom: '1.5rem',
  }),
  commentsHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  }),
  commentsTitle: css({
    margin: 0,
    fontSize: '1rem',
    fontWeight: 500,
  }),
  sortNav: css({
    display: 'flex',
    gap: '0.5rem',
  }),
  sortLink: css({
    padding: '0.25rem 0.75rem',
    fontSize: '0.875rem',
    color: '#4b5563',
    textDecoration: 'none',
    borderRadius: '0.375rem',
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  }),
  sortLinkActive: css({
    backgroundColor: '#f3f4f6',
    color: '#111827',
  }),
  divider: css({
    border: 0,
    borderTop: '1px solid #d1d5db',
  }),
  addCommentHeading: css({
    margin: '0 0 1rem',
    fontSize: '1.125rem',
    fontWeight: 500,
  }),
  signInPrompt: css({
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'underline',
  }),
  asideSticky: css({
    position: 'sticky',
    top: '1.5rem',
  }),
  asideSection: css({
    paddingBottom: '1rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  }),
  asideHeading: css({
    margin: '0 0 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#4b5563',
  }),
  categoryLink: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
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
    width: '2rem',
    height: '2rem',
    fontSize: '1rem',
    backgroundColor: '#e5e7eb',
    borderRadius: '0.375rem',
  }),
  categoryTitle: css({
    fontSize: '0.75rem',
    fontWeight: 600,
  }),
};
