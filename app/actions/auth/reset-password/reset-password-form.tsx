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

export type ResetPasswordFormProps = {
  token?: string | null;
  draft?: FormDraft;
  errors?: FormErrors;
};

export const ResetPasswordForm = clientEntry<ResetPasswordFormProps>(
  import.meta.url,
  function ResetPasswordForm(handle) {
    const resetPasswordForm = new Form({
      method: 'post',
      schema: resetPasswordSchema,
      draft: () => handle.props.draft ?? [['token', handle.props.token ?? '']],
      errors: () => handle.props.errors,
    });

    resetPasswordForm.addEventListener('statechange', handle.update);

    return () => {
      const { errors, pending } = resetPasswordForm.state;
      return (
        <form mix={[styles.form, form(resetPasswordForm)]} autoComplete="off">
          <input
            type="hidden"
            name={resetPasswordForm.field('token').name}
            defaultValue={String(resetPasswordForm.formData.get('token') ?? '')}
          />

          <TextField
            field={resetPasswordForm.field('email')}
            label="Email"
            type="email"
            placeholder="you@example.com"
            aria-required
          />
          <TextField
            field={resetPasswordForm.field('password')}
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            aria-required
          />
          <TextField
            field={resetPasswordForm.field('passwordConfirmation')}
            label="Confirm Password"
            type="password"
            placeholder="Type it once more"
            aria-required
          />

          {errors.root && <ErrorMessage error={errors.root} />}

          <Button type="submit" variant="primary" pending={pending}>
            Submit
          </Button>

          <p mix={styles.footer}>
            Remember your password?{' '}
            <a href={routes.auth.login.index.href()} mix={textLink}>
              Login
            </a>
          </p>
        </form>
      );
    };
  },
);

export const resetPasswordSchema = f
  .object({
    email: f.field(s.string().pipe(email())),
    password: f.field(s.string().pipe(minLength(8), maxLength(72))),
    passwordConfirmation: f.field(s.string().pipe(minLength(8), maxLength(72))),
    token: f.field(s.string()),
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
