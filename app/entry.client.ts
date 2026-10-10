import { revalidate } from 'pitlane/vite-plugin-remix/hmr';
import { run } from 'remix/component';

const app = run({
  async loadModule(moduleUrl, exportName) {
    const mod = await import(/* @vite-ignore */ moduleUrl);
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

if (import.meta.hot) {
  import.meta.hot.on('server:update', () => revalidate(app));
}
