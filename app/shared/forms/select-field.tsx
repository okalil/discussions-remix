import type { FieldHandle } from '@discussions/form';
import * as popover from '@remix-run/ui/popover';
import * as select from '@remix-run/ui/select';
import { css } from 'pitlane/theme';
import { on, type Handle } from 'remix/component';
import type { Props as ElementProps } from 'remix/component/jsx-runtime';

import { t } from '../../theme.ts';
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
  placeholder?: string;
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
    const { field, label, mix, placeholder, ...props } = handle.props;

    return (
      <FieldWrapper label={label} error={field.error}>
        <SelectControl
          {...props}
          name={field.name}
          defaultLabel={placeholder ?? label}
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
    width: t.size.field,
  }),
  trigger: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(2),
    padding: [t.spacing(2), t.spacing(3)],
    border: `${t.size.px} solid ${t.color.outline}`,
    borderRadius: t.shape.extraSmall,
    backgroundColor: t.color.surfaceContainerLowest,
    color: t.color.onSurface,
    fontSize: t.type.bodyMedium.size,
    lineHeight: t.type.bodyMedium.lineHeight,
    textAlign: 'left',
    cursor: 'pointer',
    '&:focus': {
      outline: 'none',
      borderColor: t.color.primary,
      boxShadow: t.elevation.focus,
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
    width: t.spacing(2),
    height: t.spacing(2),
    flex: 'none',
    borderRight: `1.5px solid ${t.color.onSurfaceVariant}`,
    borderBottom: `1.5px solid ${t.color.onSurfaceVariant}`,
    transform: 'translateY(-1px) rotate(45deg)',
  }),
  surface: css({
    position: 'fixed',
    inset: 'auto',
    margin: 0,
    padding: t.spacing(1),
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
    borderRadius: t.shape.small,
    backgroundColor: t.color.surfaceContainerLowest,
    boxShadow: t.elevation.level2,
    '&::backdrop': {
      background: 'transparent',
    },
  }),
  list: css({
    display: 'grid',
    maxHeight: t.spacing(64),
    overflow: 'auto',
    outline: 'none',
  }),
  option: css({
    padding: [t.spacing(1.5), t.spacing(2)],
    borderRadius: t.shape.extraSmall,
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurface,
    cursor: 'pointer',
    '&[data-highlighted="true"], &:hover': {
      backgroundColor: t.color.surfaceContainer,
    },
    '&[aria-selected="true"]': {
      fontWeight: t.type.labelLarge.weight,
    },
    '&[aria-disabled="true"]': {
      color: t.color.outline,
      cursor: 'not-allowed',
    },
  }),
};
