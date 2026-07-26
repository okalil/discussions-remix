import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { email, minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Button } from '../shared/button.browser.tsx';
import { ErrorMessage } from '../shared/error-message.browser.tsx';
import { TextField } from '../shared/field.browser.tsx';

export type LoginFormProps = {
  draft?: FormDraft;
  errors?: FormErrors;
};

export const LoginForm = clientEntry<LoginFormProps>(
  import.meta.url,
  function LoginForm(handle) {
    const loginForm = new Form({
      method: 'post',
      schema: loginSchema,
      draft: () => handle.props.draft,
      errors: () => handle.props.errors,
    });
    addEventListeners(loginForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      const { errors, pending } = loginForm.state;
      return (
        <form mix={[styles.form, form(loginForm)]}>
          <TextField
            field={loginForm.field('email')}
            label="Email"
            type="email"
          />
          <TextField
            field={loginForm.field('password')}
            label="Password"
            type="password"
          />

          <a href={routes.auth.forgotPassword.index.href()} mix={styles.link}>
            Forgot Password?
          </a>

          {errors.root && <ErrorMessage error={errors.root} />}

          <Button
            type="submit"
            variant="primary"
            pending={pending}
            mix={styles.submit}
          >
            Log in
          </Button>
          <p mix={styles.footer}>
            Don't have an account?{' '}
            <a href={routes.auth.register.index.href()} mix={styles.link}>
              Register now
            </a>
          </p>
        </form>
      );
    };
  },
);

export const loginSchema = f.object({
  email: f.field(s.string().pipe(email())),
  password: f.field(s.string().pipe(minLength(8))),
});

const styles = {
  form: css({
    display: 'grid',
    gap: '1rem',
  }),
  submit: css({
    height: '3rem',
  }),
  link: css({
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#4f46e5',
    textDecoration: 'none',
    '&:hover': {
      color: '#6366f1',
      textDecoration: 'underline',
    },
  }),
  footer: css({
    margin: 0,
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#4b5563',
  }),
};
