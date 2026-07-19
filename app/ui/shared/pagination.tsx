import { css, type Handle } from 'remix/ui';

type PaginationProps = {
  page: number;
  pageHref: (page: number) => string;
  totalPages: number;
};

export function Pagination(handle: Handle<PaginationProps>) {
  return () => {
    const { page, totalPages, pageHref } = handle.props;

    const pages: (number | '...')[] = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return (
      <div mix={styles.root}>
        {page === 1 ? (
          <span mix={[styles.nav, styles.disabled]}>&laquo; Prev</span>
        ) : (
          <a href={pageHref(page - 1)} mix={styles.nav}>
            &laquo; Prev
          </a>
        )}

        {pages.map((pageItem, index) =>
          pageItem === '...' ? (
            <span key={index} mix={styles.ellipsis}>
              ...
            </span>
          ) : pageItem === page ? (
            <span key={index} mix={[styles.page, styles.pageActive]}>
              {pageItem}
            </span>
          ) : (
            <a key={index} href={pageHref(pageItem)} mix={styles.page}>
              {pageItem}
            </a>
          ),
        )}

        {page === totalPages ? (
          <span mix={[styles.nav, styles.disabled]}>Next &raquo;</span>
        ) : (
          <a href={pageHref(page + 1)} mix={styles.nav}>
            Next &raquo;
          </a>
        )}
      </div>
    );
  };
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  }),
  nav: css({
    padding: '0.25rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: '#e5e7eb',
    },
  }),
  page: css({
    padding: '0.25rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: '#3b82f6',
      color: '#fff',
    },
  }),
  pageActive: css({
    backgroundColor: '#3b82f6',
    color: '#fff',
  }),
  ellipsis: css({
    padding: '0.25rem 0.75rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  }),
  disabled: css({
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  }),
};
