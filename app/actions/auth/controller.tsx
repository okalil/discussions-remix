import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { routes } from '../../routes.ts';

export default createController(routes.auth, {
  actions: {
    async logout({ session, sessionService }) {
      const userSessionId = session.get('auth') as string | null;
      if (userSessionId) await sessionService.deleteSession(userSessionId);

      session.unset('auth');
      session.regenerateId(true);

      return redirect(routes.auth.login.index.href());
    },
  },
});
