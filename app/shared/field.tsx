import { type Field as FormField } from '@discussions/form';
import { css, on, ref, type Handle } from 'remix/ui';
import {
  jsx,
  type Props as ElementProps,
  type RemixElement,
} from 'remix/ui/jsx-runtime';
import {
  Option,
  Select,
  type SelectOptionProps,
  type SelectProps,
} from 'remix/ui/select';
import { onSelectChange } from 'remix/ui/select/primitives';

import { Input, type InputProps } from './input.tsx';
import { Textarea, type TextareaProps } from './textarea.tsx';

type FieldProps = {
  label: string;
  error?: string;
  children: RemixElement;
};

export function Field(handle: Handle<FieldProps>) {
  return () => {
    const { label, error, children } = handle.props;
    const inputId = handle.id;
    const errorId = `${inputId}-error`;
    const hasError = !!error;

    return (
      <div>
        <label htmlFor={inputId} mix={styles.label}>
          {label}
        </label>
        {jsx(children.type, {
          ...children.props,
          id: inputId,
          'aria-invalid': hasError,
          'aria-describedby': hasError ? errorId : undefined,
          autoFocus: children.props.autoFocus || hasError,
        })}
        {error && (
          <span id={errorId} mix={styles.error}>
            {error}
          </span>
        )}
      </div>
    );
  };
}

type FormFieldProps<P, Extra = object> = P &
  Extra & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any Remix component doesn't support generics
    field: FormField<any>;
  };

type TextFieldProps = FormFieldProps<InputProps, { label: string }>;
export function TextField(handle: Handle<TextFieldProps>) {
  return () => {
    const { field, label, mix, ...props } = handle.props;
    return (
      <Field label={label} error={field.error}>
        <Input
          {...props}
          name={field.name}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            ref((node) => field.commit(new FormData(node.form!))),
            on('input', (e) =>
              field.commit(new FormData(e.currentTarget.form!)),
            ),
          ]}
        />
      </Field>
    );
  };
}

type TextAreaFieldProps = FormFieldProps<TextareaProps, { label: string }>;
export function TextAreaField(handle: Handle<TextAreaFieldProps>) {
  return () => {
    const { field, label, mix, ...props } = handle.props;
    return (
      <Field label={label} error={field.error}>
        <Textarea
          {...props}
          name={field.name}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            ref((node) => field.commit(new FormData(node.form!))),
            on('input', (e) =>
              field.commit(new FormData(e.currentTarget.form!)),
            ),
          ]}
        />
      </Field>
    );
  };
}

type SelectFieldProps = FormFieldProps<
  Omit<SelectProps, 'defaultLabel'>,
  { label: string; options: SelectOptionProps[] }
>;
export function SelectField(handle: Handle<SelectFieldProps>) {
  return () => {
    const { field, label, options, mix, ...props } = handle.props;
    const selectStyle = css({ width: 'min(320px, 100%)' });
    return (
      <Field label={label} error={field.error}>
        <Select
          name={field.name}
          defaultLabel={label}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            selectStyle,
            ref((node) => field.commit(new FormData(node.form!))),
            onSelectChange((e) =>
              field.commit(new FormData(e.currentTarget.form!)),
            ),
          ]}
          {...props}
        >
          {options.map((optionProps) => (
            <Option {...optionProps} />
          ))}
        </Select>
      </Field>
    );
  };
}

type FileInputProps = Pick<ElementProps<'input'>, 'accept' | 'mix'>;
type FileFieldProps = FormFieldProps<FileInputProps>;
export function FileField(handle: Handle<FileFieldProps>) {
  return () => {
    const { field, ...props } = handle.props;
    return (
      <input
        {...props}
        type="file"
        name={field.name}
        mix={[
          css({ display: 'none' }),
          on('change', (e) =>
            field.commit(new FormData(e.currentTarget.form!)),
          ),
        ]}
      />
    );
  };
}

const styles = {
  label: css({
    marginBottom: '0.25rem',
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  }),
  error: css({
    fontSize: '0.875rem',
    color: '#dc2626',
  }),
};
