import { asyncContext } from 'remix/middleware/async-context';
import { formData } from 'remix/middleware/form-data';
import { logger } from 'remix/middleware/logger';
import { staticFiles } from 'remix/middleware/static';
import { createRouter, type RouterContext } from 'remix/router';

import authController from './auth/controller.tsx';
import forgotPasswordController from './auth/forgot-password/controller.tsx';
import loginController from './auth/login/controller.tsx';
import registerController from './auth/register/controller.tsx';
import resetPasswordController from './auth/reset-password/controller.tsx';
import socialController from './auth/social/controller.tsx';
import commentsController from './comments/controller.tsx';
import discussionsController from './discussions/controller.tsx';
import newDiscussionController from './discussions/new/controller.tsx';
import { auth } from './middleware/auth.ts';
import { render } from './middleware/render.ts';
import { services } from './middleware/services.ts';
import { session } from './middleware/session.ts';
import profileController from './profile/controller.tsx';
import { routes } from './routes.ts';
import uploadsController from './uploads/controller.tsx';
import wsController from './ws/controller.ts';

const router = createRouter({
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

router.map(routes.uploads, uploadsController);
router.map(routes.discussions, discussionsController);
router.map(routes.discussions.new, newDiscussionController);
router.map(routes.comments, commentsController);
router.map(routes.auth, authController);
router.map(routes.auth.login, loginController);
router.map(routes.auth.register, registerController);
router.map(routes.auth.forgotPassword, forgotPasswordController);
router.map(routes.auth.resetPassword, resetPasswordController);
router.map(routes.auth.social, socialController);
router.map(routes.profile, profileController);
router.map(routes.ws, wsController);

export default {
  fetch: (request) => router.fetch(request),
} satisfies ExportedHandler<Env>;
