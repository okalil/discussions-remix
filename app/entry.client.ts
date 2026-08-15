import { run } from 'remix/ui';

run({
  async loadModule(moduleUrl, exportName) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
  async resolveFrame(src, options) {
    const headers = new Headers({ accept: 'text/html' });
    if (options?.target) headers.set('x-remix-target', options.target);

    const response = await fetch(src, {
      method: options?.method,
      body: options?.formData,
      credentials: 'same-origin',
      headers,
      signal: options?.signal,
    });
    return response.body ?? response.text();
  },
});
