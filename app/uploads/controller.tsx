import { createController } from 'remix/router';

import { routes } from '../routes.ts';

export default createController(routes.uploads, {
  actions: {
    async index({ storage, params }) {
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
