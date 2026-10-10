import { css } from 'pitlane/theme';

import { t } from '../theme.ts';

export const textLink = css({
  fontSize: t.type.bodyMedium.size,
  fontWeight: t.type.labelLarge.weight,
  color: t.color.primary,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});
