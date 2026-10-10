import type { FieldHandle } from '@discussions/form';
import { css } from 'pitlane/theme';
import { on, type Handle } from 'remix/component';
import type { Props as ElementProps } from 'remix/component/jsx-runtime';

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
