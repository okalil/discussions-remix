import { run, type ResolveFrameOptions } from 'remix/ui';

import { FrameSocket } from './ws/frame-socket.ts';

const frameSocket = new FrameSocket();

run({
  async loadModule(moduleUrl, exportName) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
  async resolveFrame(src, options) {
    for (const transport of transports) {
      const start = performance.now();
      const response = await transport.resolve(src, options);
      const ttfb = performance.now() - start;

      if (!response) continue;

      return withBodyTiming(response, () => {
        const total = performance.now() - start;
        const method = options?.method ?? 'GET';
        const path = src.replace(window.location.origin, '');
        const prefix = `${method} ${path} [transport: ${transport.name}]`;
        console.log(
          `${prefix} (ttfb ${ttfb.toFixed()} ms, body ${total.toFixed()} ms)`,
        );
      });
    }
    throw new Error('Failed to resolve frame');
  },
});

const transports = [
  {
    name: 'ws',
    async resolve(src: string, options?: ResolveFrameOptions) {
      try {
        if (options?.method && options.method.toLowerCase() !== 'get') {
          return;
        }
        const frameBody = await frameSocket.resolveFrame(
          src,
          options?.signal,
          options?.target,
        );
        if (frameBody != null) return frameBody;
      } catch (error) {
        if (options?.signal?.aborted) throw error;
        // Fall through to HTTP
      }
    },
  },
  {
    name: 'http',
    async resolve(src: string, options?: ResolveFrameOptions) {
      const headers = new Headers({ accept: 'text/html' });
      if (options?.target) headers.set('x-remix-target', options.target);

      const response = await fetch(src, {
        method: options?.method,
        body: options?.formData,
        credentials: 'same-origin',
        headers,
        signal: options?.signal,
      });
      return response;
    },
  },
];

function withBodyTiming<T>(response: T, onComplete: () => void): T {
  if (response instanceof ReadableStream) {
    return tapStreamComplete(response, onComplete) as T;
  }

  if (response instanceof Response) {
    if (!response.body) {
      onComplete();
      return response;
    }
    return new Response(
      tapStreamComplete(response.body, onComplete),
      response,
    ) as T;
  }

  onComplete();
  return response;
}

function tapStreamComplete(
  stream: ReadableStream<Uint8Array>,
  onComplete: () => void,
) {
  let settled = false;
  const complete = () => {
    if (settled) return;
    settled = true;
    onComplete();
  };

  const reader = stream.getReader();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          complete();
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        complete();
        controller.error(error);
      }
    },
    cancel(reason) {
      complete();
      return reader.cancel(reason);
    },
  });
}
