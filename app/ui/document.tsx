import { css, type Handle, type RemixNode } from 'remix/ui';

import { routes } from '../routes.ts';
import { NavigationProgress } from './shared/navigation-progress.browser.tsx';

export interface DocumentProps {
  children?: RemixNode;
  title?: string;
  meta?: RemixNode[];
}

const DEFAULT_TITLE = decodeURIComponent('Discussions');

export function Document(handle: Handle<DocumentProps>) {
  const { title = DEFAULT_TITLE, meta, children } = handle.props;
  return () => (
    <html lang="en" mix={css({ height: '100%' })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="/styles/setup.css" />
        <title>{title}</title>
        {meta}
      </head>
      <body mix={css({ height: '100%' })}>
        <NavigationProgress />
        {children}
        <script
          type="module"
          src={routes.assets.href({ path: 'app/entry.browser.ts' })}
        />
      </body>
    </html>
  );
}
