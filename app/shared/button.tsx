import { css, tva, type TVAProps } from 'pitlane/theme';
import { type Handle, type RemixNode } from 'remix/component';
import type { Props as ElementProps } from 'remix/component/jsx-runtime';

import { t } from '../theme.ts';
import { SpinnerIcon } from './icons/spinner-icon.tsx';

type ButtonProps = ElementProps<'button'> &
  TVAProps<typeof button> & {
    variant: NonNullable<TVAProps<typeof button>['variant']>;
    pending?: boolean;
    children?: RemixNode;
  };

export function Button(handle: Handle<ButtonProps>) {
  return () => {
    const { variant, size, block, pending, disabled, children, mix, ...props } =
      handle.props;
    const isDisabled = disabled ?? pending;

    return (
      <button
        mix={[button({ variant, size, block }), mix]}
        disabled={isDisabled}
        {...props}
      >
        <span mix={[styles.label, pending ? styles.pendingLabel : undefined]}>
          {children}
        </span>
        {pending && (
          <SpinnerIcon
            size={size === 'md' ? 24 : 20}
            aria-hidden="true"
            mix={styles.spinner}
          />
        )}
      </button>
    );
  };
}

// M3 button scale: extra-small 32dp, small 40dp (default), medium 56dp.
export const button = tva({
  base: {
    display: 'inline-grid',
    placeItems: 'center',
    borderRadius: t.shape.small,
    fontWeight: t.type.labelLarge.weight,
    fontSize: t.type.labelLarge.size,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '& > *': {
      gridArea: '1 / 1',
    },
    '&:disabled': {
      opacity: 0.8,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: t.color.primary,
        color: t.color.onPrimary,
        border: 'none',
        '&:hover:not(:disabled)': {
          backgroundColor: t.state.primary,
        },
      },
      default: {
        backgroundColor: 'transparent',
        border: `${t.size.px} solid ${t.color.outlineVariant}`,
        '&:hover:not(:disabled)': {
          backgroundColor: t.color.surfaceContainer,
        },
      },
      text: {
        backgroundColor: 'transparent',
        color: t.color.primary,
        border: 'none',
        '&:hover:not(:disabled)': {
          backgroundColor: t.color.primaryContainer,
        },
      },
      danger: {
        color: t.color.onErrorContainer,
        backgroundColor: t.color.errorContainer,
        border: 'none',
        '&:hover:not(:disabled)': {
          backgroundColor: t.state.errorContainer,
        },
      },
      github: {
        backgroundColor: t.brand.github,
        color: t.brand.onGithub,
        border: 'none',
        '&:hover:not(:disabled)': {
          backgroundColor: t.state.github,
        },
      },
    },
    size: {
      xs: {
        height: t.spacing(8),
        padding: [0, t.spacing(3)],
      },
      sm: {
        height: t.spacing(10),
        padding: [0, t.spacing(4)],
      },
      md: {
        height: t.spacing(14),
        padding: [0, t.spacing(6)],
      },
    },
    block: {
      true: {
        width: t.size.full,
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

const styles = {
  label: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: t.spacing(2),
  }),
  pendingLabel: css({
    visibility: 'hidden',
  }),
  spinner: css({
    '@keyframes spin': {
      to: { transform: 'rotate(360deg)' },
    },
    animation: 'spin 1s linear infinite',
  }),
};
