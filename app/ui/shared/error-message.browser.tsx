import { css, type Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type ErrorMessageProps = ElementProps<'div'> & {
  error: string | Error;
};

export function ErrorMessage(handle: Handle<ErrorMessageProps>) {
  return () => {
    const { error, mix, ...props } = handle.props;
    const errorMessage = typeof error === 'string' ? error : error.message;

    return (
      <div mix={[styles.root, mix]} role="alert" {...props}>
        <span mix={styles.label}>Error:</span> {errorMessage}
      </div>
    );
  };
}

const styles = {
  root: css({
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#991b1b',
    borderRadius: '0.5rem',
    backgroundColor: '#fef2f2',
  }),
  label: css({
    fontWeight: 500,
  }),
};
