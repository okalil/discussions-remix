import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';

import { t } from '../theme.ts';

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
    gap: t.spacing(2),
  }),
  nav: css({
    padding: [t.spacing(1), t.spacing(3)],
    fontSize: t.type.bodyMedium.size,
    fontWeight: t.type.labelLarge.weight,
    color: t.color.onSurfaceVariant,
    backgroundColor: t.color.surfaceContainer,
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
    borderRadius: t.shape.small,
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: t.color.surfaceContainerHigh,
    },
  }),
  page: css({
    padding: [t.spacing(1), t.spacing(3)],
    fontSize: t.type.bodyMedium.size,
    fontWeight: t.type.labelLarge.weight,
    color: t.color.onSurfaceVariant,
    backgroundColor: t.color.surfaceContainer,
    borderRadius: t.shape.small,
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: t.color.primary,
      color: t.color.onPrimary,
    },
  }),
  pageActive: css({
    backgroundColor: t.color.primary,
    color: t.color.onPrimary,
  }),
  ellipsis: css({
    padding: [t.spacing(1), t.spacing(3)],
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
  }),
  disabled: css({
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  }),
};
