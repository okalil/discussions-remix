import { asyncContext } from 'remix/async-context-middleware';
import { formData } from 'remix/form-data-middleware';
import { staticFiles } from 'remix/middleware/static';
import { createRouter, type RouterContext } from 'remix/router';

import authController from './actions/auth/controller.tsx';
import forgotPasswordController from './actions/auth/forgot-password/controller.tsx';
import loginController from './actions/auth/login/controller.tsx';
import registerController from './actions/auth/register/controller.tsx';
import resetPasswordController from './actions/auth/reset-password/controller.tsx';
import rootController from './actions/controller.tsx';
import discussionsController from './actions/discussions/controller.tsx';
import discussionsFramesController from './actions/discussions/frames/controller.tsx';
import newDiscussionController from './actions/discussions/new/controller.tsx';
import { auth } from './middleware/auth.ts';
import { render } from './middleware/render.ts';
import { services } from './middleware/services.ts';
import { session } from './middleware/session.ts';
import { routes } from './routes.ts';

export const router = createRouter({
  middleware: [
    staticFiles('./public', { index: false }),
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

router.map(routes, rootController);
router.map(routes.discussions, discussionsController);
router.map(routes.discussions.new, newDiscussionController);
router.map(routes.discussions.frames, discussionsFramesController);
router.map(routes.auth, authController);
router.map(routes.auth.login, loginController);
router.map(routes.auth.register, registerController);
router.map(routes.auth.forgotPassword, forgotPasswordController);
router.map(routes.auth.resetPassword, resetPasswordController);
