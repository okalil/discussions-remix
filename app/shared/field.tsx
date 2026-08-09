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

function getFormData(node: HTMLElement) {
  const form = node.closest('form');
  if (!form) throw new Error('Field must be inside a form');
  return new FormData(form);
}

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
            ref((node) => field.commit(getFormData(node))),
            on('input', (e) => field.commit(getFormData(e.currentTarget))),
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
            ref((node) => field.commit(getFormData(node))),
            on('input', (e) => field.commit(getFormData(e.currentTarget))),
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
            ref((node) => field.commit(getFormData(node))),
            onSelectChange((e) => field.commit(getFormData(e.currentTarget))),
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

type CheckboxFieldProps = FormFieldProps<{ label: string; value?: string }>;
export function CheckboxField(handle: Handle<CheckboxFieldProps>) {
  return () => {
    const { field, label, value = 'true', ...props } = handle.props;
    return (
      <div mix={styles.checkboxField}>
        <input
          {...props}
          id={handle.id}
          type="checkbox"
          name={field.name}
          value={value}
          defaultChecked={field.value === value}
          mix={[
            styles.checkboxFieldInput,
            ref((node) => field.commit(getFormData(node))),
            on('change', (e) => field.commit(getFormData(e.currentTarget))),
          ]}
        />
        <label htmlFor={handle.id} mix={styles.checkboxFieldLabel}>
          {label}
        </label>
      </div>
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
          on('change', (e) => field.commit(getFormData(e.currentTarget))),
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

  checkboxField: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  checkboxFieldLabel: css({
    cursor: 'pointer',
  }),
  checkboxFieldInput: css({
    width: '1rem',
    height: '1rem',
    accentColor: 'black',
    border: '1px solid #e5e7eb',
  }),
};
