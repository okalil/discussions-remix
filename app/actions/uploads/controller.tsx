import { createController } from '@discussions/router';

import type { Controller } from './+controller';

export default (createController as Controller)({
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
