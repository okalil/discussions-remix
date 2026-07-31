import type { Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type IconProps = ElementProps<'svg'> & {
  name: string;
  size?: number;
};

export function Icon(handle: Handle<IconProps>) {
  return () => {
    const { name, size = 16, ...props } = handle.props;
    return (
      <svg width={size} height={size} {...props}>
        <use href={`/icons/${name}.svg#icon`} />
      </svg>
    );
  };
}
