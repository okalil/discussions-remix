import type { FieldHandle } from '@discussions/form';
import { css, ref, type Handle } from 'remix/ui';
import {
  Option,
  Select,
  type SelectOptionProps,
  type SelectProps,
} from 'remix/ui/select';
import { onSelectChange } from 'remix/ui/select/primitives';

import { FieldWrapper } from './field-wrapper.tsx';

type SelectFieldProps = Omit<SelectProps, 'defaultLabel'> & {
  label: string;
  options: SelectOptionProps[];
  field: FieldHandle;
};

export function SelectField(handle: Handle<SelectFieldProps>) {
  return () => {
    const { field, label, options, mix, ...props } = handle.props;
    function commit(node: HTMLButtonElement) {
      if (!node.form) return;
      field.commit(new FormData(node.form));
    }
    return (
      <FieldWrapper label={label} error={field.error}>
        <Select
          name={field.name}
          defaultLabel={label}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            css({ width: 'min(320px, 100%)' }),
            ref((node) => commit(node)),
            onSelectChange((e) => commit(e.currentTarget)),
          ]}
          {...props}
        >
          {options.map((optionProps) => (
            <Option {...optionProps} />
          ))}
        </Select>
      </FieldWrapper>
    );
  };
}
