import type { FieldHandle } from '@discussions/form';
import { on, type Handle } from 'remix/component';
import type { Props as ElementProps } from 'remix/component/jsx-runtime';

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
          autoComplete={props.type === 'password' ? 'new-password' : 'off'}
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
