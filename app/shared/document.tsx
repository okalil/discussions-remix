import { css } from 'pitlane/theme';
import { type Handle, type RemixNode } from 'remix/component';
import { ImportMap } from 'remix/component/server';
import { getContext } from 'remix/middleware/async-context';
import type { Session } from 'remix/session';

import { scriptEntry, stylesheets } from '../assets.ts';
import { t, Theme } from '../theme.ts';
import { FlashToast } from './flash-toast.tsx';
import { NavigationProgress } from './navigation-progress.tsx';

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
    <html lang="en" mix={css({ height: t.size.screen, overflow: 'hidden' })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>{handle.props.title ?? DEFAULT_TITLE}</title>
        {handle.props.meta}

        <Theme />
        <link rel="stylesheet" href="/styles/setup.css" />
        <ImportMap value={scriptEntry.importMap} />
        {stylesheets.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {scriptEntry.preloads.map((href) => (
          <link key={href} rel="modulepreload" href={href} />
        ))}
        <script type="module" src={scriptEntry.href} />
      </head>
      <body mix={css({ height: t.size.screen, overflow: 'auto' })}>
        <NavigationProgress />
        {toast && <FlashToast {...toast} />}

        {handle.props.children}
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
