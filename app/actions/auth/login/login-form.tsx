import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { email, minLength } from 'remix/data-schema/checks';
import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';
import { clientEntry, css } from 'remix/ui';

import { routes } from '../../../routes.ts';
import { Button } from '../../../shared/button.tsx';
import { ErrorMessage } from '../../../shared/error-message.tsx';
import { CheckboxField } from '../../../shared/forms/checkbox-field.tsx';
import { TextField } from '../../../shared/forms/text-field.tsx';
import { addEventListeners } from '../../../shared/utils/events.ts';

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

          <div mix={styles.row}>
            <CheckboxField
              field={loginForm.field('remember')}
              label="Remember me"
            />

            <a href={routes.auth.forgotPassword.index.href()} mix={styles.link}>
              Forgot Password?
            </a>
          </div>

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
  remember: f.field(s.defaulted(coerce.boolean(), false)),
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
  row: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  footer: css({
    margin: 0,
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#4b5563',
  }),
};
