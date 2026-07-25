import { FieldChangeEvent, type FormFieldRef } from '@discussions/form';
import { css, on, type Handle } from 'remix/ui';
import { jsx, type RemixElement } from 'remix/ui/jsx-runtime';
import {
  Option,
  Select,
  type SelectOptionProps,
  type SelectProps,
} from 'remix/ui/select';
import { onSelectChange } from 'remix/ui/select/primitives';

import { Input, type InputProps } from './input.browser.tsx';
import { Textarea, type TextareaProps } from './textarea.browser.tsx';

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
    field: FormFieldRef;
  };

function dispatchFieldChange(e: Event & { currentTarget: HTMLElement }) {
  e.currentTarget.dispatchEvent(new FieldChangeEvent());
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
          mix={[mix, on('input', dispatchFieldChange)]}
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
          mix={[mix, on('input', dispatchFieldChange)]}
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
          mix={[mix, selectStyle, onSelectChange(dispatchFieldChange)]}
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
