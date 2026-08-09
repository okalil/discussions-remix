import { attrs, css } from 'remix/ui';

export function checkbox() {
  return [
    attrs({ type: 'checkbox' }),
    css({
      width: '1rem',
      height: '1rem',
      accentColor: 'black',
      border: '1px solid #e5e7eb',
    }),
  ];
}
