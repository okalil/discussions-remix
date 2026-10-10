import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';
import type { Props as ElementProps } from 'remix/component/jsx-runtime';

import { t } from '../theme.ts';

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
    padding: t.spacing(4),
    fontSize: t.type.bodyMedium.size,
    color: t.color.onErrorContainer,
    borderRadius: t.shape.medium,
    backgroundColor: t.color.errorContainer,
  }),
  label: css({
    fontWeight: t.type.labelLarge.weight,
  }),
};
