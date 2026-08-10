import { createController } from 'remix/router';
import type { Router } from 'remix/router';

import { routes } from '../routes.ts';
import type { ClientMessage, ServerMessage } from './protocol.ts';

export default createController(routes.ws, {
  actions: {
    frames({ request, router }) {
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      const [client, server] = Object.values(new WebSocketPair());

      server.accept();
      server.addEventListener('message', async (event) => {
        const message = JSON.parse(String(event.data)) as ClientMessage;

        if (message.type === 'resolve') {
          const { id, src, target } = message;
          try {
            const response = await resolveFrame(router, request, src, target);
            send({
              type: 'frame',
              id,
              status: response.status,
              url: response.url,
              body: await response.text(),
            });
          } catch (error) {
            send({
              type: 'error',
              id,
              message:
                error instanceof Error ? error.message : 'Frame resolve failed',
            });
          }
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });

      function send(message: ServerMessage) {
        server.send(JSON.stringify(message));
      }
    },
  },
});

async function resolveFrame(
  router: Pick<Router, 'fetch'>,
  request: Request,
  src: string,
  target?: string,
) {
  const url = new URL(src, request.url);

  const headers = new Headers();
  headers.set('Accept', 'text/html');

  const cookie = request.headers.get('Cookie');
  if (cookie) headers.set('Cookie', cookie);
  if (target) headers.set('x-remix-target', target);

  const response = await router.fetch(
    new Request(url, {
      method: 'GET',
      headers,
      signal: request.signal,
    }),
  );
  return response;
}
