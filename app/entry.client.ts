import { run } from 'remix/component';

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
