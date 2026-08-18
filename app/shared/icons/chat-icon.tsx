import type { Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type ChatIconProps = ElementProps<'svg'> & {
  size?: number;
};

export function ChatIcon(handle: Handle<ChatIconProps>) {
  return () => {
    const { size = 16, ...props } = handle.props;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 -960 960 960"
        {...props}
      >
        <path
          d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"
          fill="currentColor"
        />
      </svg>
    );
  };
}
