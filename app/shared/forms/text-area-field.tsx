import type { FieldHandle } from '@discussions/form';
import { css, on, type Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

import { FieldWrapper } from './field-wrapper.tsx';
import { input } from './input.tsx';

type TextAreaFieldProps = ElementProps<'textarea'> & {
  label: string;
  field: FieldHandle;
};

export function TextAreaField(handle: Handle<TextAreaFieldProps>) {
  return () => {
    const { field, label, mix, ...props } = handle.props;
    const defaultValue = String(field.value ?? '');
    return (
      <FieldWrapper label={label} error={field.error}>
        <textarea
          {...props}
          name={field.name}
          children={
            defaultValue as unknown as ElementProps<'textarea'>['children']
          }
          mix={[
            mix,
            input(),
            css({ resize: 'vertical' }),
            on('input', () => field.onChange()),
            on('blur', () => field.onBlur()),
          ]}
        />
      </FieldWrapper>
    );
  };
}
