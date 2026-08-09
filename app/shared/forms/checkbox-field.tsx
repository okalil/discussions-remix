import type { FieldHandle } from '@discussions/form';
import { css, on, ref, type Handle } from 'remix/ui';

import { checkbox } from './checkbox.tsx';

type CheckboxFieldProps = {
  label: string;
  value?: string;
  field: FieldHandle;
};

export function CheckboxField(handle: Handle<CheckboxFieldProps>) {
  return () => {
    const { field, label, value = 'true', ...props } = handle.props;
    function commit(node: HTMLInputElement) {
      if (!node.form) return;
      field.commit(new FormData(node.form));
    }
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
            ref((node) => commit(node)),
            on('change', (e) => commit(e.currentTarget)),
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
    gap: '0.5rem',
  }),
  label: css({
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#374151',
  }),
};
