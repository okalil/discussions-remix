import { css } from 'pitlane/theme';
import { clientEntry, Frame, on } from 'remix/component';

import { t } from '../../theme.ts';

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

    handle.queueTask(() => {
      handle.signal.addEventListener('abort', () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
      });
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
    fontSize: t.type.titleMedium.size,
    fontWeight: t.type.labelLarge.weight,
    color: t.color.onSurface,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
    '&:visited': {
      color: t.color.onSurfaceVariant,
    },
  }),
  panel: css({
    position: 'absolute',
    bottom: t.size.full,
    left: 0,
    zIndex: 20,
    width: t.size.preview,
    marginBottom: t.spacing(1),
    backgroundColor: t.color.surfaceContainerLowest,
    borderRadius: t.shape.small,
    boxShadow: t.elevation.level2,
  }),
  loading: css({
    padding: t.spacing(3),
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
  }),
};
