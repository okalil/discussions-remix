import type { Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type ArrowUpIconProps = ElementProps<'svg'> & {
  size?: number;
};

export function ArrowUpIcon(handle: Handle<ArrowUpIconProps>) {
  return () => {
    const { size = 16, ...props } = handle.props;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        {...props}
      >
        <path fill="none" d="M0 0h24v24H0V0z" />
        <path
          d="m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"
          fill="currentColor"
        />
      </svg>
    );
  };
}
