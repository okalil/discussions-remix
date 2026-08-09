import type { FieldHandle } from '@discussions/form';
import { css, on, type Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type FileFieldProps = Pick<ElementProps<'input'>, 'accept' | 'multiple'> & {
  field: FieldHandle;
};

export function FileField(handle: Handle<FileFieldProps>) {
  return () => {
    const { field, ...props } = handle.props;
    function commit(node: HTMLInputElement) {
      if (!node.form) return;
      field.commit(new FormData(node.form));
    }
    return (
      <input
        {...props}
        type="file"
        name={field.name}
        mix={[styles.hidden, on('change', (e) => commit(e.currentTarget))]}
      />
    );
  };
}

const styles = {
  hidden: css({ display: 'none' }),
};
