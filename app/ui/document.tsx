import { mergeAssets } from '@pitlane/dev/runtime';
import { getContext } from 'remix/async-context-middleware';
import type { Session } from 'remix/session';
import { css, type Handle, type RemixNode } from 'remix/ui';

import clientAssets from '../entry.client.ts?assets=client';
import serverAssets from '../entry.server.ts?assets=ssr';
import { FlashToast } from './shared/flash-toast.tsx';
import { NavigationProgress } from './shared/navigation-progress.tsx';

export interface DocumentProps {
  children?: RemixNode;
  title?: string;
  meta?: RemixNode[];
}

const DEFAULT_TITLE = decodeURIComponent('Discussions');

export function Document(handle: Handle<DocumentProps>) {
  const { session } = getContext();
  const toast = getFlashToast(session);

  const assets = mergeAssets(clientAssets, serverAssets);

  return () => (
    <html lang="en" mix={css({ height: '100%' })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>{handle.props.title ?? DEFAULT_TITLE}</title>
        {handle.props.meta}

        <link rel="stylesheet" href="/styles/setup.css" />
        {assets.css.map((attrs) => (
          <link key={attrs.href} {...attrs} rel="stylesheet" />
        ))}
        {assets.js.map((attrs) => (
          <link key={attrs.href} {...attrs} rel="modulepreload" />
        ))}
        <script async src={clientAssets.entry} type="module" />
      </head>
      <body mix={css({ height: '100%' })}>
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
