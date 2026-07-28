import { clientEntry, css, Frame, on } from 'remix/ui';

type DiscussionLinkProps = {
  href: string;
  previewHref: string;
  children: string;
};

export const DiscussionLink = clientEntry<DiscussionLinkProps>(
  import.meta.url,
  function DiscussionLink(handle) {
    let open = false;
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    handle.signal.addEventListener('abort', () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    });

    function scheduleOpen() {
      clearTimeout(closeTimer);
      openTimer = setTimeout(() => {
        open = true;
        handle.update();
      }, 400);
    }

    function scheduleClose() {
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => {
        open = false;
        handle.update();
      }, 200);
    }

    return () => {
      const { href, previewHref, children } = handle.props;
      return (
        <div mix={styles.root}>
          <a
            href={href}
            mix={[
              styles.title,
              on('pointerenter', scheduleOpen),
              on('pointerleave', scheduleClose),
            ]}
          >
            {children}
          </a>

          {open && (
            <div
              mix={[
                styles.panel,
                on('pointerenter', () => clearTimeout(closeTimer)),
                on('pointerleave', scheduleClose),
              ]}
            >
              <Frame src={previewHref} />
            </div>
          )}
        </div>
      );
    };
  },
);

const styles = {
  root: css({
    position: 'relative',
    display: 'inline',
  }),
  title: css({
    fontSize: '1.125rem',
    fontWeight: 500,
    color: '#111827',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
    '&:visited': {
      color: '#4b5563',
    },
  }),
  panel: css({
    position: 'absolute',
    bottom: '100%',
    left: 0,
    zIndex: 20,
    width: '300px',
    marginBottom: '0.25rem',
    backgroundColor: '#fff',
    borderRadius: '0.375rem',
    boxShadow:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  }),
  loading: css({
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  }),
};
