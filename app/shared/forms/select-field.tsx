import type { FieldHandle } from '@discussions/form';
import * as popover from '@remix-run/ui/popover';
import * as select from '@remix-run/ui/select';
import { css, on, type Handle } from 'remix/component';
import type { Props as ElementProps } from 'remix/component/jsx-runtime';

import { FieldWrapper } from './field-wrapper.tsx';

type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type SelectControlProps = Omit<ElementProps<'button'>, 'children' | 'name'> & {
  defaultLabel: string;
  defaultValue?: string;
  name?: string;
  options: SelectOption[];
};

type SelectFieldProps = Omit<
  SelectControlProps,
  'defaultLabel' | 'defaultValue' | 'name'
> & {
  field: FieldHandle;
  label: string;
};

function SelectLabel(handle: Handle) {
  const context = handle.context.get(select.Context);

  return () => <span mix={styles.triggerLabel}>{context.displayedLabel}</span>;
}

function SelectControl(handle: Handle<SelectControlProps>) {
  return () => {
    const {
      defaultLabel,
      defaultValue,
      disabled,
      mix,
      name,
      options,
      ...buttonProps
    } = handle.props;

    return (
      <select.Context
        defaultLabel={defaultLabel}
        defaultValue={defaultValue}
        disabled={disabled}
        name={name}
      >
        <button
          type="button"
          {...buttonProps}
          disabled={disabled}
          mix={[styles.trigger, select.trigger(), mix]}
        >
          <SelectLabel />
          <span aria-hidden="true" mix={styles.chevron} />
        </button>
        <popover.Context>
          <div mix={[styles.surface, select.popover()]}>
            <div mix={[styles.list, select.list()]}>
              {options.map((option) => (
                <div
                  key={option.value}
                  mix={[
                    styles.option,
                    select.option({
                      disabled: option.disabled,
                      label: option.label,
                      value: option.value,
                    }),
                  ]}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        </popover.Context>
        {name && <input mix={select.hiddenInput()} />}
      </select.Context>
    );
  };
}

export function SelectField(handle: Handle<SelectFieldProps>) {
  return () => {
    const { field, label, mix, ...props } = handle.props;

    return (
      <FieldWrapper label={label} error={field.error}>
        <SelectControl
          {...props}
          name={field.name}
          defaultLabel={label}
          defaultValue={String(field.value ?? '')}
          mix={[
            mix,
            styles.width,
            select.onSelectChange(() => field.onChange()),
            on('blur', () => field.onBlur()),
          ]}
        />
      </FieldWrapper>
    );
  };
}

const styles = {
  width: css({
    width: 'min(320px, 100%)',
  }),
  trigger: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    backgroundColor: '#fff',
    color: '#111827',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'left',
    cursor: 'pointer',
    '&:focus': {
      outline: 'none',
      borderColor: '#6366f1',
      boxShadow: '0 0 0 1px #6366f1, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    '&:disabled': {
      opacity: 0.55,
      cursor: 'not-allowed',
    },
  }),
  triggerLabel: css({
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  chevron: css({
    width: '0.45rem',
    height: '0.45rem',
    flex: 'none',
    borderRight: '1.5px solid #6b7280',
    borderBottom: '1.5px solid #6b7280',
    transform: 'translateY(-1px) rotate(45deg)',
  }),
  surface: css({
    position: 'fixed',
    inset: 'auto',
    margin: 0,
    padding: '0.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    backgroundColor: '#fff',
    boxShadow:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '&::backdrop': {
      background: 'transparent',
    },
  }),
  list: css({
    display: 'grid',
    maxHeight: '16rem',
    overflow: 'auto',
    outline: 'none',
  }),
  option: css({
    padding: '0.375rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    color: '#111827',
    cursor: 'pointer',
    '&[data-highlighted="true"], &:hover': {
      backgroundColor: '#f3f4f6',
    },
    '&[aria-selected="true"]': {
      fontWeight: 500,
    },
    '&[aria-disabled="true"]': {
      color: '#9ca3af',
      cursor: 'not-allowed',
    },
  }),
};
