import { createController } from 'remix/router';

import { routes } from '../../routes.ts';
import { Layout } from '../../ui/layout.tsx';

export default createController(routes.discussions, {
  actions: {
    async index({ render }) {
      return render(
        <Layout title="Discussions">
          <h1>Discussions</h1>
        </Layout>,
      );
    },
    async show() {
      return new Response('Not implemented', { status: 501 });
    },
    async vote() {
      return new Response('Not implemented', { status: 501 });
    },
    async hovercard() {
      return new Response('Not implemented', { status: 501 });
    },
  },
});
