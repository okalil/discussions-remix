import { field, Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { email, maxLength, minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Button } from '../shared/button.browser.tsx';
import { ErrorMessage } from '../shared/error-message.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Input } from '../shared/input.browser.tsx';

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
          <Field label="Name" error={errors.name}>
            <Input
              mix={field(registerForm, 'name')}
              type="text"
              aria-required
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input
              mix={field(registerForm, 'email')}
              type="email"
              aria-required
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <Input
              mix={field(registerForm, 'password')}
              type="password"
              aria-required
            />
          </Field>
          <Field label="Confirm password" error={errors.passwordConfirmation}>
            <Input
              mix={field(registerForm, 'passwordConfirmation')}
              type="password"
              aria-required
            />
          </Field>

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
