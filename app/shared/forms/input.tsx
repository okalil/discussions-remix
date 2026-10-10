import { css } from 'pitlane/theme';

import { t } from '../../theme.ts';

export function input() {
  return css({
    width: t.size.full,
    padding: [t.spacing(2), t.spacing(3)],
    border: `${t.size.px} solid ${t.color.outline}`,
    borderRadius: t.shape.extraSmall,
    backgroundColor: t.color.surfaceContainerLowest,
    color: t.color.onSurface,
    fontSize: t.type.bodyMedium.size,
    '&:focus': {
      outline: 'none',
      borderColor: t.color.primary,
      boxShadow: t.elevation.focus,
    },
  });
}
