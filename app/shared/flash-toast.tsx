import { clientEntry, css, on } from 'remix/ui';

type FlashToastProps = {
  message: string;
  type: 'success' | 'error';
};

export const FlashToast = clientEntry<FlashToastProps>(
  import.meta.url,
  function FlashToast(handle) {
    let visible = false;
    let closeTimeout: ReturnType<typeof setTimeout> | undefined;

    function close() {
      visible = false;
      handle.update();
    }

    function scheduleClose() {
      closeTimeout = setTimeout(close, 4000);
    }

    handle.queueTask(() => {
      visible = true;
      handle.update();

      scheduleClose();
    });

    return () => (
      <div mix={styles.root}>
        <div
          mix={[
            styles.toast,
            on('pointerenter', () => clearTimeout(closeTimeout)),
            on('pointerleave', scheduleClose),
          ]}
          data-visible={visible}
          data-type={handle.props.type}
        >
          <div mix={styles.icon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              height="20"
              width="20"
            >
              {handle.props.type === 'success' && (
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                />
              )}
              {handle.props.type === 'error' && (
                <path
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                />
              )}
            </svg>
          </div>
          <div mix={styles.title}>{handle.props.message}</div>
          <button
            type="button"
            aria-label="Close toast"
            mix={[styles.close, on('click', close)]}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  },
);

const styles = {
  root: css({
    position: 'fixed',
    top: 24,
    right: 24,
    width: 356,
    zIndex: 999999999,
    boxSizing: 'border-box',
    pointerEvents: 'none',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
    '@media (max-width: 600px)': {
      left: 16,
      right: 16,
      width: 'auto',
    },
  }),
  toast: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    padding: 16,
    borderRadius: 8,
    border: '1px solid',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    fontSize: 13,
    boxSizing: 'border-box',
    overflowWrap: 'anywhere',
    outline: 'none',
    opacity: 0,
    transform: 'translateY(-100%)',
    transition: 'transform 400ms, opacity 400ms, box-shadow 200ms',
    '&[data-visible="true"]': {
      opacity: 1,
      transform: 'translateY(0)',
      pointerEvents: 'auto',
    },

    '&[data-type="success"]': {
      background: 'hsl(143, 85%, 96%)',
      borderColor: 'hsl(145, 92%, 87%)',
      color: 'hsl(140, 100%, 27%)',
    },
    '&[data-type="error"]': {
      background: 'hsl(359, 100%, 97%)',
      borderColor: 'hsl(359, 100%, 94%)',
      color: 'hsl(360, 100%, 45%)',
    },
    '&:focus-visible': {
      boxShadow:
        '0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.2)',
    },
    '@media (prefers-reduced-motion)': {
      transition: 'none',
    },
  }),
  icon: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexShrink: 0,
    width: 16,
    height: 16,
    marginLeft: -3,
    marginRight: 4,
  }),
  title: css({
    fontWeight: 500,
    lineHeight: 1.5,
    color: 'inherit',
  }),
  close: css({
    position: 'absolute',
    right: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    padding: 0,
    borderRadius: '50%',
    border: '1px solid',
    cursor: 'pointer',
    zIndex: 1,
    transform: 'translate(35%, -35%)',
    transition: 'opacity 100ms, background 200ms, border-color 200ms',
    background: 'inherit',
    borderColor: 'inherit',
    color: 'inherit',
    '&:focus-visible': {
      boxShadow:
        '0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.2)',
    },
  }),
};
