import { getContext } from 'remix/async-context-middleware';
import type { Session } from 'remix/session';
import { css, type Handle, type RemixNode } from 'remix/ui';

import { routes } from '../routes.ts';
import { FlashToast } from './shared/flash-toast.browser.tsx';
import { NavigationProgress } from './shared/navigation-progress.browser.tsx';

export interface DocumentProps {
  children?: RemixNode;
  title?: string;
  meta?: RemixNode[];
}

const DEFAULT_TITLE = decodeURIComponent('Discussions');

export function Document(handle: Handle<DocumentProps>) {
  const { session } = getContext();
  const toast = getFlashToast(session);

  return () => (
    <html lang="en" mix={css({ height: '100%' })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="/styles/setup.css" />
        <title>{handle.props.title ?? DEFAULT_TITLE}</title>
        {handle.props.meta}
      </head>
      <body mix={css({ height: '100%' })}>
        <NavigationProgress />
        {toast && <FlashToast {...toast} />}

        {handle.props.children}

        <script
          type="module"
          src={routes.assets.href({ path: 'app/entry.browser.ts' })}
        />
      </body>
    </html>
  );
}

function getFlashToast(session: Session) {
  for (const type of ['error', 'success'] as const) {
    const message = session.get(type);
    if (typeof message !== 'string') continue;

    return { type, message };
  }
  return null;
}
