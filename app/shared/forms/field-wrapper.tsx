import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';
import { jsx, type RemixElement } from 'remix/component/jsx-runtime';

import { t } from '../../theme.ts';

type FieldWrapperProps = {
  label: string;
  error?: string;
  children: RemixElement;
};

export function FieldWrapper(handle: Handle<FieldWrapperProps>) {
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

const styles = {
  label: css({
    marginBottom: t.spacing(1),
    display: 'block',
    fontSize: t.type.labelLarge.size,
    fontWeight: t.type.labelLarge.weight,
    color: t.color.onSurfaceVariant,
  }),
  error: css({
    fontSize: t.type.bodyMedium.size,
    color: t.color.error,
  }),
};
