import { css } from 'pitlane/theme';
import { attrs } from 'remix/component';

import { t } from '../../theme.ts';

export function checkbox() {
  return [
    attrs({ type: 'checkbox' }),
    css({
      width: t.spacing(4),
      height: t.spacing(4),
      accentColor: t.color.primary,
      border: `${t.size.px} solid ${t.color.outlineVariant}`,
    }),
  ];
}
