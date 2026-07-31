import { run } from 'remix/ui';

run({
  async loadModule(moduleUrl, exportName) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
  async resolveFrame(src, signal, target) {
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
