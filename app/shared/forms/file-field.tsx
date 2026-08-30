import type { FieldHandle } from '@discussions/form';
import { css, on, type Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type FileFieldProps = Pick<ElementProps<'input'>, 'accept' | 'multiple'> & {
  field: FieldHandle;
};

export function FileField(handle: Handle<FileFieldProps>) {
  return () => {
    const { field, ...props } = handle.props;
    return (
      <input
        {...props}
        type="file"
        name={field.name}
        mix={[
          styles.hidden,
          on('change', () => field.onChange()),
          on('blur', () => field.onBlur()),
        ]}
      />
    );
  };
}

const styles = {
  hidden: css({ display: 'none' }),
};
