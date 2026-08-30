import type { FieldHandle } from '@discussions/form';
import { on, type Handle } from 'remix/ui';
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
    return (
      <FieldWrapper label={label} error={field.error}>
        <input
          {...props}
          name={field.name}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            input(),
            on('input', () => field.onChange()),
            on('blur', () => field.onBlur()),
          ]}
        />
      </FieldWrapper>
    );
  };
}
