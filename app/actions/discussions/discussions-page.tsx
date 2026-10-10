import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';

import type { Category } from '../../../core/category.types.ts';
import type { DiscussionSummary } from '../../../core/discussion.types.ts';
import { routes } from '../../routes.ts';
import { button } from '../../shared/button.tsx';
import { input } from '../../shared/forms/input.tsx';
import { DiscussionIcon } from '../../shared/icons/discussion-icon.tsx';
import { Layout } from '../../shared/layout.tsx';
import { Pagination } from '../../shared/pagination.tsx';
import { t } from '../../theme.ts';
import { DiscussionRow } from './discussion-row.tsx';

type DiscussionsPageProps = {
  categories: Category[];
  discussions: DiscussionSummary[];
  total: number;
  limit: number;
  page: number;
  filters: {
    q?: string;
    category?: string;
  };
  authenticated: boolean;
};

export function DiscussionsPage(handle: Handle<DiscussionsPageProps>) {
  return () => {
    const {
      categories,
      discussions,
      total,
      limit,
      page,
      filters,
      authenticated,
    } = handle.props;

    const totalPages = Math.ceil(total / limit);
    const category = filters.category
      ? categories.find((it) => it.slug === filters.category)
      : null;
    const countLabel = total === 1 ? '1 discussion' : `${total} discussions`;

    return (
      <Layout title={`Discussions | ${category?.title ?? 'All discussions'}`}>
        <div mix={styles.root}>
          <header mix={styles.header}>
            <div mix={styles.intro}>
              <h1 mix={styles.title}>
                {category && (
                  <span mix={styles.titleEmoji}>{category.emoji}</span>
                )}
                {category?.title ?? 'Discussions'}
              </h1>
              <p mix={styles.lede}>
                {category?.description ??
                  'Every discussion, across all categories.'}
              </p>
            </div>

            {authenticated && (
              <a
                href={routes.discussions.new.index.href()}
                mix={[button({ variant: 'primary' }), styles.newDiscussion]}
              >
                New Discussion
              </a>
            )}
          </header>

          <form mix={styles.searchForm} autoComplete="off">
            <input
              type="search"
              name="q"
              autoComplete="off"
              placeholder={
                category ? 'Search this category' : 'Search all discussions'
              }
              defaultValue={filters.q}
              data-rmx-key={filters.q ?? ''}
              mix={input()}
            />
          </form>

          <div mix={styles.grid}>
            <section mix={styles.sidebar}>
              <h2 mix={styles.sectionTitle}>Categories</h2>
              <nav>
                <a
                  href={routes.discussions.index.href()}
                  mix={[
                    styles.navLink,
                    !filters.category && styles.navLinkActive,
                  ]}
                >
                  <DiscussionIcon size={16} />
                  <span mix={styles.navLabel}>View all discussions</span>
                </a>
                {categories.map((it) => (
                  <a
                    key={it.id}
                    href={routes.discussions.index.href({ category: it.slug })}
                    mix={[
                      styles.navLink,
                      filters.category === it.slug && styles.navLinkActive,
                    ]}
                  >
                    {it.emoji}
                    <span mix={styles.navLabel}>{it.title}</span>
                  </a>
                ))}
              </nav>
            </section>

            <div>
              {discussions.length ? (
                <>
                  <h2 mix={styles.sectionTitle}>{countLabel}</h2>
                  <ul mix={styles.list}>
                    {discussions.map((it) => (
                      <DiscussionRow
                        key={it.id}
                        discussion={it}
                        authenticated={handle.props.authenticated}
                      />
                    ))}
                  </ul>
                </>
              ) : (
                <div mix={styles.empty}>
                  <h2 mix={styles.sectionTitle}>
                    {filters.q ? 'No matches' : 'No discussions yet'}
                  </h2>
                  <p mix={styles.emptyText}>
                    {filters.q
                      ? 'Try a different search.'
                      : category
                        ? 'Nothing has been posted in this category.'
                        : 'Start one and it will show up here.'}
                  </p>
                </div>
              )}

              {!!totalPages && (
                <Pagination
                  page={page}
                  pageHref={(targetPage) =>
                    routes.discussions.index.href(
                      { category: filters.category },
                      { searchParams: { page: targetPage, q: filters.q } },
                    )
                  }
                  totalPages={totalPages}
                />
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  };
}

const styles = {
  root: css({
    padding: [t.spacing(6), t.spacing(3)],
    maxWidth: t.size.page,
    margin: [0, 'auto'],
  }),
  header: css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing(4),
    marginBottom: t.spacing(6),
  }),
  intro: css({
    flex: '1 1 auto',
  }),
  title: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(2),
    margin: 0,
    fontSize: t.type.headlineSmall.size,
    fontWeight: t.type.titleMedium.weight,
  }),
  titleEmoji: css({
    fontSize: t.type.headlineSmall.size,
  }),
  lede: css({
    margin: [t.spacing(1), 0, 0],
    color: t.color.onSurfaceVariant,
    fontSize: t.type.bodyMedium.size,
  }),
  newDiscussion: css({
    marginLeft: 'auto',
  }),
  searchForm: css({
    marginBottom: t.spacing(6),
  }),
  grid: css({
    display: 'grid',
    gap: t.spacing(4),
    '@media (min-width: 768px)': {
      gridTemplateColumns: `${t.spacing(64)} 1fr`,
    },
  }),
  sidebar: css({
    padding: [0, t.spacing(2)],
    '@media (max-width: 767px)': {
      gridRowStart: 2,
    },
  }),
  sectionTitle: css({
    margin: [0, 0, t.spacing(4)],
    fontSize: t.type.titleMedium.size,
    fontWeight: t.type.titleMedium.weight,
    color: t.color.onSurface,
  }),
  navLink: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(2),
    minHeight: t.spacing(9),
    padding: [t.spacing(1.5), t.spacing(2)],
    color: t.color.onSurface,
    textDecoration: 'none',
    borderRadius: t.shape.small,
    '&:hover': {
      backgroundColor: t.color.surfaceContainer,
    },
  }),
  navLinkActive: css({
    backgroundColor: t.color.surfaceContainerHigh,
    '&:hover': {
      backgroundColor: t.color.surfaceContainerHigh,
    },
    '& span': {
      fontWeight: t.type.titleMedium.weight,
    },
  }),
  navLabel: css({
    fontSize: t.type.bodyMedium.size,
  }),
  empty: css({
    display: 'grid',
    gap: t.spacing(1),
  }),
  emptyText: css({
    margin: 0,
    color: t.color.onSurfaceVariant,
    fontSize: t.type.bodyMedium.size,
  }),
  list: css({
    margin: [0, 0, t.spacing(4)],
    padding: 0,
    listStyle: 'none',
  }),
};
