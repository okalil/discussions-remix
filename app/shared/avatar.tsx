import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';
import type { Props as ElementProps } from 'remix/component/jsx-runtime';

import { t } from '../theme.ts';

type AvatarProps = {
  src?: string | null;
  alt: string;
  size: number;
  fallback?: string;
  title?: string;
  mix?: ElementProps<'div'>['mix'];
};

export function Avatar(handle: Handle<AvatarProps>) {
  return () => {
    const { size, src, alt, fallback, title, mix } = handle.props;

    return (
      <div
        title={title}
        mix={[styles.root, mix]}
        style={{ width: size, height: size }}
      >
        {src && <img mix={styles.image} src={parseSource(src)} alt={alt} />}
        {fallback != undefined && (
          <span mix={styles.fallback} style={{ fontSize: size / 2 }}>
            {fallback}
          </span>
        )}
      </div>
    );
  };
}

function parseSource(src: string) {
  try {
    return new URL(src).toString();
  } catch {
    return `/uploads/${src}`;
  }
}

const styles = {
  root: css({
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: t.shape.full,
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
  }),
  image: css({
    position: 'relative',
    zIndex: 1,
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    width: t.size.full,
    height: t.size.full,
  }),
  fallback: css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.shape.full,
    backgroundColor: t.color.surfaceContainer,
    color: t.color.onSurfaceVariant,
  }),
};
