import { css, type Handle } from 'remix/ui';
import { jsx, type RemixElement } from 'remix/ui/jsx-runtime';

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
