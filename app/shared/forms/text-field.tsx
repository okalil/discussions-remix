import type { FieldHandle } from '@discussions/form';
import { on, ref, type Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

import { FieldWrapper } from './field-wrapper.tsx';
import { input } from './input.tsx';

type TextFieldProps = ElementProps<'input'> & {
  label: string;
  field: FieldHandle;
};

export function TextField(handle: Handle<TextFieldProps>) {
  return () => {
    const { field, label, mix, ...props } = handle.props;
    function commit(node: HTMLInputElement) {
      if (!node.form) return;
      field.commit(new FormData(node.form));
    }
    return (
      <FieldWrapper label={label} error={field.error}>
        <input
          {...props}
          name={field.name}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            input(),
            ref((node) => commit(node)),
            on('input', (e) => commit(e.currentTarget)),
          ]}
        />
      </FieldWrapper>
    );
  };
}
