import { css, type Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type TextareaProps = ElementProps<'textarea'>;

export function Textarea(handle: Handle<TextareaProps>) {
  return () => {
    const { mix, ...props } = handle.props;
    return <textarea mix={[styles.textarea, mix]} {...props} />;
  };
}

const styles = {
  textarea: css({
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    '&:focus': {
      outline: 'none',
      borderColor: '#6366f1',
      boxShadow: '0 0 0 1px #6366f1, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
  }),
};
