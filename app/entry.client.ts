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
      const end = performance.now();

      if (!response) continue;

      const method = options?.method ?? 'GET';
      const path = src.replace(window.location.origin, '');
      const duration = end - start;
      console.log(
        `${method} ${path} [transport: ${transport.name}] (${duration.toFixed()} ms)`,
      );

      return response;
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
