import { css, type Handle, type RemixNode } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

import { Icon } from './icon.browser.tsx';

type ButtonProps = ElementProps<'button'> & {
  variant: 'primary' | 'default' | 'danger';
  pending?: boolean;
  children?: RemixNode;
};

export function Button(handle: Handle<ButtonProps>) {
  return () => {
    const { variant, pending, disabled, children, mix, ...props } =
      handle.props;
    const isDisabled = disabled ?? pending;

    return (
      <button
        mix={[styles.base, variant && styles[variant], mix]}
        disabled={isDisabled}
        {...props}
      >
        {pending ? (
          <Icon name="spinner" size={16} mix={styles.spinner} />
        ) : (
          children
        )}
      </button>
    );
  };
}

const styles = {
  base: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    '&:disabled': {
      opacity: 0.8,
      cursor: 'not-allowed',
    },
  }),
  primary: css({
    backgroundColor: '#111827',
    color: '#f9fafb',
    border: 'none',
    '&:hover:not(:disabled)': {
      backgroundColor: '#1f2937',
    },
  }),
  default: css({
    backgroundColor: 'transparent',
    border: '1px solid #e5e7eb',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f9fafb',
    },
  }),
  danger: css({
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    border: 'none',
    '&:hover:not(:disabled)': {
      backgroundColor: '#fecaca',
    },
  }),
  spinner: css({
    '@keyframes spin': {
      to: { transform: 'rotate(360deg)' },
    },
    animation: 'spin 1s linear infinite',
  }),
};
