import type { FieldHandle } from '@discussions/form';
import { css } from 'pitlane/theme';
import { on, type Handle } from 'remix/component';

import { t } from '../../theme.ts';
import { checkbox } from './checkbox.tsx';

type CheckboxFieldProps = {
  label: string;
  value?: string;
  field: FieldHandle;
};

export function CheckboxField(handle: Handle<CheckboxFieldProps>) {
  return () => {
    const { field, label, value = 'true', ...props } = handle.props;
    return (
      <div mix={styles.root}>
        <input
          {...props}
          id={handle.id}
          name={field.name}
          value={value}
          defaultChecked={field.value === value}
          mix={[
            checkbox(),
            on('change', () => field.onChange()),
            on('blur', () => field.onBlur()),
          ]}
        />
        <label htmlFor={handle.id} mix={styles.label}>
          {label}
        </label>
      </div>
    );
  };
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: t.spacing(2),
  }),
  label: css({
    cursor: 'pointer',
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
  }),
};
