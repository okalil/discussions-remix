import { css, type Handle } from 'remix/ui';
import type { Props as ElementProps } from 'remix/ui/jsx-runtime';

type AvatarProps = {
  src?: string | null;
  alt: string;
  size: number;
  fallback?: string;
  mix?: ElementProps<'div'>['mix'];
};

export function Avatar(handle: Handle<AvatarProps>) {
  return () => {
    const { size, src, alt, fallback, mix } = handle.props;

    return (
      <div mix={[styles.root, mix]} style={{ width: size, height: size }}>
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
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
  }),
  image: css({
    position: 'relative',
    zIndex: 1,
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  }),
  fallback: css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  }),
};
