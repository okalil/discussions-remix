import { createController } from 'remix/router';

import { assetServer } from '../assets.ts';
import { storage } from '../core/integrations/storage.ts';
import { routes } from '../routes.ts';

export default createController(routes, {
  actions: {
    async assets({ request }) {
      return (
        (await assetServer.fetch(request)) ??
        new Response('Not found', { status: 404 })
      );
    },
    async uploads({ params }) {
      const file = await storage.get(params.key);

      if (!file) {
        throw new Response('File not found', { status: 404 });
      }

      return new Response(file.stream(), {
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `attachment; filename=${file.name}`,
        },
      });
    },
  },
});
