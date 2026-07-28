import { renderWith } from 'remix/middleware/render';
import { createHtmlResponse } from 'remix/response/html';
import type { Router } from 'remix/router';
import type { RemixNode } from 'remix/ui';
import { renderToStream } from 'remix/ui/server';

export function render() {
  return renderWith(
    ({ request, router }) =>
      function render(node: RemixNode, init?: ResponseInit) {
        const stream = renderToStream(node, {
          frameSrc: request.url,
          signal: request.signal,
          resolveFrame: (src) => resolveFrame(router, request, src),
        });

        return createHtmlResponse(stream, init);
      },
  );
}

async function resolveFrame(router: Router, request: Request, src: string) {
  const url = new URL(src, request.url);

  const headers = new Headers();
  headers.set('Accept', 'text/html');

  const cookie = request.headers.get('Cookie');
  if (cookie) headers.set('Cookie', cookie);

  const response = await router.fetch(
    new Request(url, {
      method: 'GET',
      headers,
      signal: request.signal,
    }),
  );

  if (!response.ok) {
    return `<pre>Frame error: ${response.status} ${response.statusText}</pre>`;
  }

  if (response.body) return response.body;
  return await response.text();
}
