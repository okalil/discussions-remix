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
      const inflight = new Map<string, AbortController>();

      server.accept();
      server.addEventListener('message', (event) => {
        const message = JSON.parse(String(event.data)) as ClientMessage;

        if (message.type === 'abort') {
          inflight.get(message.id)?.abort();
          return;
        }

        if (message.type === 'resolve') {
          void handleResolve(message);
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });

      async function handleResolve(message: Extract<ClientMessage, { type: 'resolve' }>) {
        const { id, src, target } = message;
        const abort = new AbortController();
        inflight.set(id, abort);

        if (request.signal.aborted) {
          abort.abort(request.signal.reason);
        } else {
          request.signal.addEventListener('abort', () => abort.abort(), {
            once: true,
          });
        }

        try {
          const response = await resolveFrame(
            router,
            request,
            src,
            target,
            abort.signal,
          );
          if (abort.signal.aborted) return;

          send({
            type: 'frame-start',
            id,
            status: response.status,
            url: response.url,
          });

          await pipeBody(response.body, id, abort.signal);
        } catch (error) {
          if (abort.signal.aborted) return;
          send({
            type: 'error',
            id,
            message:
              error instanceof Error ? error.message : 'Frame resolve failed',
          });
        } finally {
          inflight.delete(id);
        }
      }

      async function pipeBody(
        body: ReadableStream<Uint8Array> | null,
        id: string,
        signal: AbortSignal,
      ) {
        if (!body) {
          if (!signal.aborted) send({ type: 'frame-end', id });
          return;
        }

        const reader = body.getReader();
        const decoder = new TextDecoder();

        try {
          while (!signal.aborted) {
            const { done, value } = await reader.read();
            if (done) break;
            if (signal.aborted) break;

            const text = decoder.decode(value, { stream: true });
            if (text) send({ type: 'frame-chunk', id, body: text });
          }

          if (signal.aborted) return;

          const rest = decoder.decode();
          if (rest) send({ type: 'frame-chunk', id, body: rest });
          send({ type: 'frame-end', id });
        } catch (error) {
          if (signal.aborted) return;
          throw error;
        } finally {
          try {
            reader.releaseLock();
          } catch {
            // Reader already released if the stream cancelled.
          }
        }
      }

      function send(message: ServerMessage) {
        if (server.readyState !== WebSocket.OPEN) return;
        server.send(JSON.stringify(message));
      }
    },
  },
});

async function resolveFrame(
  router: Pick<Router, 'fetch'>,
  request: Request,
  src: string,
  target: string | undefined,
  signal: AbortSignal,
) {
  const url = new URL(src, request.url);

  const headers = new Headers();
  headers.set('Accept', 'text/html');

  const cookie = request.headers.get('Cookie');
  if (cookie) headers.set('Cookie', cookie);
  if (target) headers.set('x-remix-target', target);

  return router.fetch(
    new Request(url, {
      method: 'GET',
      headers,
      signal,
    }),
  );
}
