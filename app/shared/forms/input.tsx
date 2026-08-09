import { css } from 'remix/ui';

export function input() {
  return css({
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    fontSize: '0.875rem',
    '&:focus': {
      outline: 'none',
      borderColor: '#6366f1',
      boxShadow: '0 0 0 1px #6366f1, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
  });
}
