import { run } from 'remix/ui';

run({
  async loadModule(moduleUrl, exportName) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
  async resolveFrame(src, options) {
    return fetch(src, {
      method: options?.method,
      body: options?.formData,
      headers: { Accept: 'text/html' },
      signal: options?.signal,
    });
  },
});
