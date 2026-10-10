import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import { css } from 'pitlane/theme';
import { clientEntry } from 'remix/component';
import * as s from 'remix/data-schema';
import { email } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';

import { routes } from '../../../routes.ts';
import { Button } from '../../../shared/button.tsx';
import { TextField } from '../../../shared/forms/text-field.tsx';
import { textLink } from '../../../shared/text-link.tsx';
import { t } from '../../../theme.ts';

export type ForgotPasswordFormProps = {
  draft?: FormDraft;
  errors?: FormErrors;
};

export const ForgotPasswordForm = clientEntry<ForgotPasswordFormProps>(
  import.meta.url,
  function ForgotPasswordForm(handle) {
    const forgotPasswordForm = new Form({
      method: 'post',
      schema: forgotPasswordSchema,
      draft: () => handle.props.draft,
      errors: () => handle.props.errors,
    });

    forgotPasswordForm.addEventListener('statechange', handle.update);

    return () => {
      const { pending } = forgotPasswordForm.state;

      return (
        <form mix={[styles.form, form(forgotPasswordForm)]} autoComplete="off">
          <TextField
            field={forgotPasswordForm.field('email')}
            label="Email"
            type="email"
            placeholder="you@example.com"
            aria-required
          />

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

export const forgotPasswordSchema = f.object({
  email: f.field(s.string().pipe(email())),
});

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
