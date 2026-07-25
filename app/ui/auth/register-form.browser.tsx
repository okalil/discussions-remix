import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { email, maxLength, minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Button } from '../shared/button.browser.tsx';
import { ErrorMessage } from '../shared/error-message.browser.tsx';
import { TextField } from '../shared/field.browser.tsx';

export type RegisterFormProps = {
  draft?: FormDraft;
  errors?: FormErrors;
};

export const RegisterForm = clientEntry<RegisterFormProps>(
  import.meta.url,
  function RegisterForm(handle) {
    const registerForm = new Form({
      method: 'post',
      schema: registerSchema,
      draft: handle.props.draft,
    });
    addEventListeners(registerForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      registerForm.mergeState({ errors: handle.props.errors });
      const { errors, pending } = registerForm.state;
      return (
        <form mix={[styles.form, form(registerForm)]}>
          <TextField
            field={registerForm.field('name')}
            label="Name"
            type="text"
            aria-required
          />
          <TextField
            field={registerForm.field('email')}
            label="Email"
            type="email"
            aria-required
          />
          <TextField
            field={registerForm.field('password')}
            label="Password"
            type="password"
            aria-required
          />
          <TextField
            field={registerForm.field('passwordConfirmation')}
            label="Confirm password"
            type="password"
            aria-required
          />

          {errors.root && <ErrorMessage error={errors.root} />}

          <Button
            type="submit"
            variant="primary"
            pending={pending}
            mix={styles.submit}
          >
            Register
          </Button>

          <p mix={styles.footer}>
            Already have an account?{' '}
            <a href={routes.auth.login.index.href()} mix={styles.link}>
              Sign in now
            </a>
          </p>
        </form>
      );
    };
  },
);

export const registerSchema = f
  .object({
    name: f.field(s.string().pipe(minLength(1))),
    email: f.field(s.string().pipe(email())),
    password: f.field(s.string().pipe(minLength(8), maxLength(72))),
    passwordConfirmation: f.field(s.string().pipe(minLength(8), maxLength(72))),
  })
  .refine(
    (data) => data.password === data.passwordConfirmation,
    'Passwords do not match',
  );

const styles = {
  form: css({
    display: 'grid',
    gap: '1rem',
  }),
  submit: css({
    height: '3rem',
  }),
  footer: css({
    margin: 0,
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#4b5563',
  }),
  link: css({
    color: '#4f46e5',
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      color: '#6366f1',
      textDecoration: 'underline',
    },
  }),
};
