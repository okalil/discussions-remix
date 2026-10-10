import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import { css } from 'pitlane/theme';
import { clientEntry } from 'remix/component';
import * as s from 'remix/data-schema';
import { email, maxLength, minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';

import { routes } from '../../../routes.ts';
import { Button } from '../../../shared/button.tsx';
import { ErrorMessage } from '../../../shared/error-message.tsx';
import { TextField } from '../../../shared/forms/text-field.tsx';
import { textLink } from '../../../shared/text-link.tsx';
import { t } from '../../../theme.ts';

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
      draft: () => handle.props.draft,
      errors: () => handle.props.errors,
    });

    registerForm.addEventListener('statechange', handle.update);

    return () => {
      const { errors, pending } = registerForm.state;
      return (
        <form mix={[styles.form, form(registerForm)]} autoComplete="off">
          <TextField
            field={registerForm.field('name')}
            label="Name"
            type="text"
            placeholder="What should we call you?"
            aria-required
          />
          <TextField
            field={registerForm.field('email')}
            label="Email"
            type="email"
            placeholder="you@example.com"
            aria-required
          />
          <TextField
            field={registerForm.field('password')}
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            aria-required
          />
          <TextField
            field={registerForm.field('passwordConfirmation')}
            label="Confirm password"
            type="password"
            placeholder="Type it once more"
            aria-required
          />

          {errors.root && <ErrorMessage error={errors.root} />}

          <Button type="submit" variant="primary" pending={pending}>
            Register
          </Button>

          <p mix={styles.footer}>
            Already have an account?{' '}
            <a href={routes.auth.login.index.href()} mix={textLink}>
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
    gap: t.spacing(4),
  }),
  footer: css({
    textAlign: 'center',
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
  }),
};
