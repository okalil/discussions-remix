import { css, type Handle } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Layout } from '../layout.tsx';
import { Button } from '../shared/button.browser.tsx';
import { Icon } from '../shared/icon.browser.tsx';
import { Input } from '../shared/input.browser.tsx';
import { Pagination } from '../shared/pagination.tsx';
import { DiscussionRow, type DiscussionListItem } from './discussion-row.tsx';

type Category = {
  id: number;
  emoji: string;
  title: string;
  description: string;
  slug: string;
};

type DiscussionsPageProps = {
  categories: Category[];
  discussions: DiscussionListItem[];
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

    return (
      <Layout title={`Discussions | ${category?.title ?? 'All discussions'}`}>
        <div mix={styles.root}>
          <div mix={styles.toolbar}>
            <form mix={styles.searchForm}>
              <Input
                type="search"
                name="q"
                placeholder="Search all discussions"
                defaultValue={filters.q}
              />
            </form>

            {authenticated && (
              <form action={routes.discussions.new.index.href()}>
                <Button type="submit" variant="primary" mix={styles.newButton}>
                  New Discussion
                </Button>
              </form>
            )}
          </div>

          <div mix={styles.grid}>
            <section mix={styles.sidebar}>
              <h2 mix={styles.sidebarTitle}>Categories</h2>
              <nav>
                <a
                  href={routes.discussions.index.href()}
                  mix={[
                    styles.navLink,
                    !filters.category && styles.navLinkActive,
                  ]}
                >
                  <Icon name="discussion" size={16} />
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
              <div mix={styles.heading}>
                {category ? (
                  <>
                    <h2 mix={styles.categoryTitle}>
                      <span mix={styles.categoryEmoji}>{category.emoji}</span>{' '}
                      {category.title} ({total})
                    </h2>
                    <p mix={styles.categoryDescription}>
                      {category.description}
                    </p>
                  </>
                ) : (
                  <h2 mix={styles.listTitle}>Discussions ({total})</h2>
                )}
              </div>

              <ul mix={styles.list}>
                {discussions.map((it) => (
                  <DiscussionRow
                    key={it.id}
                    discussion={it}
                    authenticated={handle.props.authenticated}
                  />
                ))}
              </ul>

              {!!totalPages && (
                <Pagination
                  page={page}
                  pageHref={(targetPage) =>
                    routes.discussions.index.href(
                      filters.category ? { category: filters.category } : null,
                      {
                        page: targetPage,
                        q: filters.q,
                      },
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
    padding: '1.5rem 0.75rem',
    maxWidth: '64rem',
    margin: '0 auto',
  }),
  toolbar: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.25rem',
    height: '2.5rem',
    marginBottom: '1rem',
  }),
  searchForm: css({
    flex: 1,
  }),
  newButton: css({
    height: '100%',
  }),
  grid: css({
    display: 'grid',
    gap: '1rem',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '16rem 1fr',
    },
  }),
  sidebar: css({
    padding: '0 0.5rem',
    '@media (max-width: 767px)': {
      gridRowStart: 2,
    },
  }),
  sidebarTitle: css({
    margin: '0 0 1rem',
    fontWeight: 600,
    fontSize: '1rem',
  }),
  navLink: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.5rem',
    color: '#1f2937',
    textDecoration: 'none',
    borderRadius: '0.375rem',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  }),
  navLinkActive: css({
    backgroundColor: '#f3f4f6',
    '& span': {
      fontWeight: 600,
    },
  }),
  navLabel: css({
    fontSize: '0.875rem',
  }),
  heading: css({
    marginBottom: '0.5rem',
  }),
  categoryTitle: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: 0,
    fontWeight: 600,
    fontSize: '1rem',
  }),
  categoryEmoji: css({
    fontSize: '1.125rem',
  }),
  categoryDescription: css({
    margin: 0,
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
    fontSize: '0.875rem',
  }),
  listTitle: css({
    margin: 0,
    fontWeight: 600,
    fontSize: '1rem',
  }),
  list: css({
    margin: '0 0 1rem',
    padding: 0,
    listStyle: 'none',
  }),
};
