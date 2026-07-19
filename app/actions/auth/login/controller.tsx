import { completeAuth } from 'remix/auth';
import { redirect } from 'remix/response/redirect';
import { createController } from 'remix/router';
import { css, type Handle } from 'remix/ui';

import { routes } from '../../../routes.ts';
import { AuthLayout } from '../../../ui/auth/layout.tsx';
import {
  LoginForm,
  loginValidator,
  type LoginFormProps,
} from '../../../ui/auth/login.browser.tsx';
import { Document } from '../../../ui/document.tsx';
import { Button } from '../../../ui/shared/button.browser.tsx';
import { Icon } from '../../../ui/shared/icon.browser.tsx';

export default createController(routes.auth.login, {
  actions: {
    async index({ render }) {
      return render(<LoginPage />);
    },
    async action(context) {
      const validation = loginValidator.validate(context.formData);
      if (validation.errors) {
        return context.render(
          <LoginPage
            draft={validation.getDraft({ omit: ['password'] })}
            errors={validation.errors}
          />,
          { status: 422 },
        );
      }

      const user = await context.accountService.getUserByCredentials(
        validation.data,
      );
      if (!user) {
        return context.render(
          <LoginPage
            draft={validation.getDraft({ omit: ['password'] })}
            errors={{ root: 'Invalid email or password' }}
          />,
          { status: 400 },
        );
      }

      const userSession = await context.sessionService.createSession(user.id);
      const session = completeAuth(context);
      session.set('auth', userSession.id);

      session.flash('success', 'Signed in successfully!');
      return redirect(routes.discussions.index.href());
    },
  },
});

function LoginPage(handle: Handle<LoginFormProps>) {
  return () => (
    <Document title="Login">
      <AuthLayout title="Login">
        <div>
          <form
            method="post"
            action={routes.auth.social.start.href({ provider: 'github' })}
          >
            <Button variant="primary" mix={styles.githubButton}>
              <Icon name="github" size={20} />
              Continue with Github
            </Button>
          </form>

          <div mix={styles.divider}>
            <hr />
            <span mix={styles.dividerLabel}>or</span>
          </div>

          <LoginForm {...handle.props} />
        </div>
      </AuthLayout>
    </Document>
  );
}

const styles = {
  githubButton: css({
    gap: '0.5rem',
    height: '3rem',
    width: '100%',
  }),
  divider: css({
    position: 'relative',
    margin: '1.5rem 0',
  }),
  dividerLabel: css({
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '0 1rem',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '0.875rem',
  }),
};
