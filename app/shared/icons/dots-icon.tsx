import type { Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type DotsIconProps = ElementProps<'svg'> & {
  size?: number;
};

export function DotsIcon(handle: Handle<DotsIconProps>) {
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
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          fill="currentColor"
        />
      </svg>
    );
  };
}
