import { createRouter } from '@discussions/router';
import { asyncContext } from 'remix/middleware/async-context';
import { formData } from 'remix/middleware/form-data';
import { logger } from 'remix/middleware/logger';
import { render } from 'remix/middleware/render';
import { staticFiles } from 'remix/middleware/static';
import type { RouterContext } from 'remix/router';

import { assets } from './assets.ts';
import { auth } from './middleware/auth.ts';
import { services } from './middleware/services.ts';
import { session } from './middleware/session.ts';
import { routes } from './routes.ts';

const controllers = import.meta.glob('/app/actions/**/controller.{ts,tsx}', {
  eager: true,
});

const router = createRouter({
  routes,
  controllers,
  middleware: [
    staticFiles('./public', { index: false }),
    logger({ format: '%method %path %status (%duration ms)' }),
    services(),
    formData(),
    session(),
    auth(),
    render({ assets }),
    asyncContext(),
  ],
});

export type AppContext = RouterContext<typeof router>;

declare module 'remix' {
  interface RouterTypes {
    context: AppContext;
  }
}

export default {
  fetch: (request) => router.fetch(request),
} satisfies ExportedHandler<Env>;
