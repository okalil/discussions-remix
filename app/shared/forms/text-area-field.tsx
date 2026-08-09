import type { FieldHandle } from '@discussions/form';
import { css, on, ref, type Handle } from 'remix/ui';
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
    function commit(node: HTMLTextAreaElement) {
      if (!node.form) return;
      field.commit(new FormData(node.form));
    }
    return (
      <FieldWrapper label={label} error={field.error}>
        <textarea
          {...props}
          name={field.name}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            input(),
            css({ resize: 'vertical' }),
            ref((node) => commit(node)),
            on('input', (e) => commit(e.currentTarget)),
          ]}
        />
      </FieldWrapper>
    );
  };
}
