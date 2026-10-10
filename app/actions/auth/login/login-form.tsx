import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import { css } from 'pitlane/theme';
import { clientEntry } from 'remix/component';
import * as s from 'remix/data-schema';
import { email, minLength } from 'remix/data-schema/checks';
import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';

import { routes } from '../../../routes.ts';
import { Button } from '../../../shared/button.tsx';
import { ErrorMessage } from '../../../shared/error-message.tsx';
import { CheckboxField } from '../../../shared/forms/checkbox-field.tsx';
import { TextField } from '../../../shared/forms/text-field.tsx';
import { textLink } from '../../../shared/text-link.tsx';
import { t } from '../../../theme.ts';

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

    loginForm.addEventListener('statechange', handle.update);

    return () => {
      const { errors, pending } = loginForm.state;
      return (
        <form mix={[styles.form, form(loginForm)]} autoComplete="off">
          <TextField
            field={loginForm.field('email')}
            label="Email"
            type="email"
            placeholder="you@example.com"
          />
          <TextField
            field={loginForm.field('password')}
            label="Password"
            type="password"
            placeholder="At least 8 characters"
          />

          <div mix={styles.row}>
            <CheckboxField
              field={loginForm.field('remember')}
              label="Remember me"
            />

            <a href={routes.auth.forgotPassword.index.href()} mix={textLink}>
              Forgot Password?
            </a>
          </div>

          {errors.root && <ErrorMessage error={errors.root} />}

          <Button type="submit" variant="primary" pending={pending}>
            Log in
          </Button>
          <p mix={styles.footer}>
            Don't have an account?{' '}
            <a href={routes.auth.register.index.href()} mix={textLink}>
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
    gap: t.spacing(4),
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  footer: css({
    textAlign: 'center',
    fontSize: t.type.bodyMedium.size,
    color: t.color.onSurfaceVariant,
  }),
};
