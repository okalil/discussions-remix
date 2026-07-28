import { asyncContext } from 'remix/async-context-middleware';
import { formData } from 'remix/form-data-middleware';
import { staticFiles } from 'remix/middleware/static';
import { createRouter, type RouterContext } from 'remix/router';

import authController from './actions/auth/controller.tsx';
import forgotPasswordController from './actions/auth/forgot-password/controller.tsx';
import loginController from './actions/auth/login/controller.tsx';
import registerController from './actions/auth/register/controller.tsx';
import resetPasswordController from './actions/auth/reset-password/controller.tsx';
import commentsController from './actions/comments/controller.tsx';
import rootController from './actions/controller.tsx';
import discussionsController from './actions/discussions/controller.tsx';
import newDiscussionController from './actions/discussions/new/controller.tsx';
import profileController from './actions/profile/controller.tsx';
import { auth } from './middleware/auth.ts';
import { render } from './middleware/render.ts';
import { services } from './middleware/services.ts';
import { session } from './middleware/session.ts';
import { routes } from './routes.ts';

const router = createRouter({
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
router.map(routes.comments, commentsController);
router.map(routes.auth, authController);
router.map(routes.auth.login, loginController);
router.map(routes.auth.register, registerController);
router.map(routes.auth.forgotPassword, forgotPasswordController);
router.map(routes.auth.resetPassword, resetPasswordController);
router.map(routes.profile, profileController);

export default router;
