import { createRouter } from '@discussions/router';
import { asyncContext } from 'remix/middleware/async-context';
import { formData } from 'remix/middleware/form-data';
import { logger } from 'remix/middleware/logger';
import { staticFiles } from 'remix/middleware/static';
import type { RouterContext } from 'remix/router';

import { auth } from './middleware/auth.ts';
import { render } from './middleware/render.ts';
import { services } from './middleware/services.ts';
import { session } from './middleware/session.ts';
import { routes } from './routes.ts';

const router = createRouter({
  routes,
  routesDirectory: '.',
  routesModules: import.meta.glob('./**/controller.{ts,tsx}', {
    eager: true,
  }),
  middleware: [
    staticFiles('./public', { index: false }),
    logger({ format: '%method %path %status (%duration ms)' }),
    services(),
    formData(),
    session(),
    auth(),
    render(),
    asyncContext(),
  ],
});

export type AppContext = RouterContext<typeof router>;

declare module 'remix/router' {
  interface RouterTypes {
    context: AppContext;
  }
}

export default {
  fetch: (request) => router.fetch(request),
} satisfies ExportedHandler<Env>;
