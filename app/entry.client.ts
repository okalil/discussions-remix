import { run } from 'remix/ui';

import { FrameSocket } from './ws/frame-socket.ts';

const frameSocket = new FrameSocket();

run({
  async loadModule(moduleUrl, exportName) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
  async resolveFrame(src, signal, target) {
    try {
      const frameBody = await frameSocket.resolveFrame(src, signal, target);
      if (frameBody != null) return frameBody;
    } catch (error) {
      if (signal?.aborted) throw error;
      // Fall through to HTTP
    }

    const headers = new Headers({ accept: 'text/html' });
    if (target) headers.set('x-remix-target', target);

    const response = await fetch(src, {
      credentials: 'same-origin',
      headers,
      signal,
    });
    return response.body ?? response.text();
  },
});
